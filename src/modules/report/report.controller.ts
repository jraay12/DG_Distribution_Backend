import { NextFunction, Request, Response } from "express";
import { ReportService } from "./report.service";

export class ReportController {
  constructor(private reportService: ReportService) {}

  private sendCsv(res: Response, filename: string, rows: Record<string, unknown>[]) {
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escape).join(","),
      ...rows.map(row => headers.map(header => escape(row[header])).join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  }

  sales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportService.sales(req.query as any);
      if (req.query.format === "csv") {
        return this.sendCsv(res, "sales-report.csv", data.records.map(row => ({
          transaction_id: row.id,
          date: row.createdAt.toISOString(),
          agent: row.storeVisit.user.name,
          store: row.storeVisit.customer.store_name,
          subtotal: row.subtotal_amount?.toString() ?? "0",
          discount: row.discount_amount?.toString() ?? "0",
          total: row.total_amount?.toString() ?? "0",
          promo_code: row.promoCode?.code ?? "",
        })));
      }
      res.status(200).json({ data });
    }
    catch (error) { next(error); }
  };
  inventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportService.inventory();
      if (req.query.format === "csv") {
        return this.sendCsv(res, "inventory-report.csv", data.records.map(row => ({
          product_id: row.id,
          product: row.product_name,
          model: row.model.model_name,
          brand: row.model.brand.brand_name,
          warehouse_quantity: row.inventory?.quantity ?? 0,
          reorder_level: row.inventory?.reorder_level ?? "",
          store_quantity: row.storeInventory.reduce((sum, item) => sum + item.quantity, 0),
        })));
      }
      res.status(200).json({ data });
    }
    catch (error) { next(error); }
  };
  agents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportService.agents(req.query as any);
      if (req.query.format === "csv") return this.sendCsv(res, "agent-performance-report.csv", data);
      res.status(200).json({ data });
    }
    catch (error) { next(error); }
  };
}
