import { Money } from "../money";
export interface Discount {
    readonly code: string;
    readonly label: string;
    readonly amount: Money;
}
export declare function createDiscount(discount: Discount): Discount;
//# sourceMappingURL=discount.d.ts.map