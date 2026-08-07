import { Currency } from "./currency";
export interface Money {
    readonly amount: number;
    readonly currency: Currency;
}
export declare function createMoney(value: Money): Money;
export declare function equalsMoney(left: Money, right: Money): boolean;
//# sourceMappingURL=money.d.ts.map