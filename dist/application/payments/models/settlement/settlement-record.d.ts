import { SettlementReference } from "./settlement-reference";
import { SettlementStatus } from "./settlement-status";
export interface SettlementRecord {
    readonly reference: SettlementReference;
    readonly settledAt: Date;
    readonly amount: number;
    readonly currency: string;
    readonly status: SettlementStatus;
}
export declare function createSettlementRecord(record: SettlementRecord): SettlementRecord;
//# sourceMappingURL=settlement-record.d.ts.map