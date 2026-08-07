import { Money } from "../money";
export interface PricingTotal {
    readonly subtotal: Money;
    readonly taxTotal: Money;
    readonly feeTotal: Money;
    readonly discountTotal: Money;
    readonly markupTotal: Money;
    readonly commissionTotal: Money;
    readonly grandTotal: Money;
}
export declare function createPricingTotal(total: PricingTotal): PricingTotal;
//# sourceMappingURL=pricing-total.d.ts.map