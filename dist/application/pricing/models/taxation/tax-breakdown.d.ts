import { Money } from "../money";
import { Tax } from "./tax";
export interface TaxBreakdown {
    readonly entries: ReadonlyArray<Tax>;
    readonly total: Money;
}
export declare function createTaxBreakdown(breakdown: TaxBreakdown): TaxBreakdown;
//# sourceMappingURL=tax-breakdown.d.ts.map