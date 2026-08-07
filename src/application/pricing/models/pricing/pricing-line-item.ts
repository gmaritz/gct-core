import { createMoney, Money } from "../money";

export interface PricingLineItem {
  readonly code: string;
  readonly label: string;
  readonly unitAmount: Money;
  readonly totalAmount: Money;
  readonly quantity: number;
}

export function createPricingLineItem(item: PricingLineItem): PricingLineItem {
  return Object.freeze({
    code: item.code,
    label: item.label,
    unitAmount: createMoney(item.unitAmount),
    totalAmount: createMoney(item.totalAmount),
    quantity: item.quantity,
  });
}
