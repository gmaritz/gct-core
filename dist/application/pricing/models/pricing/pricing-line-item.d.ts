import { Money } from "../money";
export interface PricingLineItem {
    readonly code: string;
    readonly label: string;
    readonly unitAmount: Money;
    readonly totalAmount: Money;
    readonly quantity: number;
    readonly metadata?: Readonly<Record<string, string>>;
}
export declare function createPricingLineItem(item: PricingLineItem): PricingLineItem;
//# sourceMappingURL=pricing-line-item.d.ts.map