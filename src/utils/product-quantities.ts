import { BadRequestError } from "./error/BadRequestError";
import { nonnegativeInteger, requiredText } from "./input";

export function productQuantities(input: unknown, allowZero: boolean): Map<string, number> {
  if (!Array.isArray(input) || !input.length) {
    throw new BadRequestError("Provide at least one item");
  }
  const items = new Map<string, number>();
  for (const item of input) {
    const id = requiredText(item?.product_id, "product_id");
    const quantity = nonnegativeInteger(item?.quantity, "quantity");
    if (!allowZero && !quantity) throw new BadRequestError("Order quantity must be positive");
    if (items.has(id)) throw new BadRequestError("Each product may appear only once");
    items.set(id, quantity);
  }
  return items;
}
