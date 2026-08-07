import { Money } from "../money";
import { TaxType } from "./tax-type";
export interface Tax {
    readonly code: string;
    readonly type: TaxType;
    readonly amount: Money;
    readonly description?: string;
}
export declare function createTax(tax: Tax): Tax;
//# sourceMappingURL=tax.d.ts.map