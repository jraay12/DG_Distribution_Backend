import { Prisma } from "@prisma/client";
import { ExtendedPrismaClient } from "../../config/prisma";
import { visitDateRange } from "../../utils/calendar-date";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ConflictError } from "../../utils/error/ConflictError";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { requiredText } from "../../utils/input";
import { Payload } from "../../utils/jwt";
import { productQuantities } from "../../utils/product-quantities";
import { StoreInventoryRepositiory } from "../inventory/store-inventory.repository";
import { StoreVisitRepository } from "../store-visit/store-visit.repository";
import { OrderDetails, OrderRepository } from "./order.repository";

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private visitRepo: StoreVisitRepository,
    private inventoryRepo: StoreInventoryRepositiory,
    private prisma: ExtendedPrismaClient,
  ) {}

  async submit(store_visit_id: string, input: { items?: unknown }, requester: Payload) {
    const actual = productQuantities(input?.items, false);
    const order = await this.prisma.$transaction(async (transaction) => {
      const tx = transaction as ExtendedPrismaClient;
      const [visit] = await this.visitRepo.lockForOrdering(store_visit_id, tx);
      if (!visit) throw new NotFoundError("Store visit not found");
      if (visit.user_id !== requester.user_id) throw new ForbiddenError("This visit is assigned to another agent");
      if (!visit.time_in) throw new ConflictError("Check in before submitting an order");

      const existing = await this.orderRepo.findByVisit(store_visit_id, tx);
      if (existing) {
        const ordered = existing.items.filter((item) => item.actual_quantity > 0);
        if (ordered.length === actual.size && ordered.every((item) => actual.get(item.product_id) === item.actual_quantity)) {
          return existing;
        }
        throw new ConflictError("The customer order for this visit is already final");
      }

      const counted = await this.inventoryRepo.findVisitCount(store_visit_id, tx);
      if (!counted.length) throw new ConflictError("Submit store inventory before ordering");
      const suggested = new Map(counted
        .filter((item) => item.suggested_quantity > 0 && !item.product.deletedAt)
        .map((item) => [item.product_id, item.suggested_quantity]));
      const ids = [...new Set([...actual.keys(), ...suggested.keys()])];
      const products = await tx.product.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true, price: true },
      });
      if (products.length !== ids.length) throw new NotFoundError("One or more active products were not found");
      const items = products.map((product) => ({
        product_id: product.id,
        suggested_quantity: suggested.get(product.id) ?? 0,
        actual_quantity: actual.get(product.id) ?? 0,
        unit_price: product.price,
      }));
      return this.orderRepo.create(store_visit_id, items, tx);
    });
    return this.format(order);
  }

  async getByVisit(store_visit_id: string, requester: Payload) {
    const order = await this.orderRepo.findByVisit(store_visit_id);
    if (!order) throw new NotFoundError("Customer order not found");
    if (requester.role === "USER" && order.storeVisit.user_id !== requester.user_id) {
      throw new ForbiddenError("This visit is assigned to another agent");
    }
    return this.format(order);
  }

  async list(query: {
    from?: unknown; to?: unknown; customer_id?: unknown; user_id?: unknown; page?: unknown; limit?: unknown;
  }) {
    const optionalId = (value: unknown, field: string) => value === undefined ? undefined : requiredText(value, field);
    const page = this.pagination(query.page, 1, 1_000_000);
    const limit = this.pagination(query.limit, 25, 100);
    const result = await this.orderRepo.list({
      createdAt: visitDateRange(query),
      storeVisit: {
        customer_id: optionalId(query.customer_id, "customer_id"),
        user_id: optionalId(query.user_id, "user_id"),
      },
    }, page, limit);
    return { ...result, data: result.data.map((order) => this.format(order)) };
  }

  private pagination(value: unknown, defaultValue: number, max: number) {
    if (value === undefined) return defaultValue;
    if (typeof value !== "string" || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) {
      throw new BadRequestError(`Pagination value must be between 1 and ${max}`);
    }
    return Number(value);
  }

  private format(order: OrderDetails) {
    const total_amount = order.items.reduce(
      (total, item) => total.plus(item.unit_price.times(item.actual_quantity)), new Prisma.Decimal(0),
    );
    return { ...order, total_amount: total_amount.toFixed(2) };
  }
}
