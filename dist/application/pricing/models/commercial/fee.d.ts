import { Money } from "../money";
export interface Fee {
    readonly code: string;
    readonly label: string;
    readonly amount: Money;
}
export declare function createFee(fee: Fee): Fee;
//# sourceMappingURL=fee.d.ts.map