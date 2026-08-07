import { createMoney, Money } from "../money";

export interface Discount {
  readonly code: string;
  readonly label: string;
  readonly amount: Money;
}

export function createDiscount(discount: Discount): Discount {
  return Object.freeze({
    code: discount.code,
    label: discount.label,
    amount: createMoney(discount.amount),
  });
}
