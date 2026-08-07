import { Money } from "../money";
export interface Commission {
    readonly code: string;
    readonly label: string;
    readonly amount: Money;
}
export declare function createCommission(commission: Commission): Commission;
//# sourceMappingURL=commission.d.ts.map