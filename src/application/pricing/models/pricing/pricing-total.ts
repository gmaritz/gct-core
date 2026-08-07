import { createMoney, Money } from "../money";

export interface PricingTotal {
  readonly subtotal: Money;
  readonly taxTotal: Money;
  readonly feeTotal: Money;
  readonly discountTotal: Money;
  readonly markupTotal: Money;
  readonly commissionTotal: Money;
  readonly grandTotal: Money;
}

export function createPricingTotal(total: PricingTotal): PricingTotal {
  return Object.freeze({
    subtotal: createMoney(total.subtotal),
    taxTotal: createMoney(total.taxTotal),
    feeTotal: createMoney(total.feeTotal),
    discountTotal: createMoney(total.discountTotal),
    markupTotal: createMoney(total.markupTotal),
    commissionTotal: createMoney(total.commissionTotal),
    grandTotal: createMoney(total.grandTotal),
  });
}
