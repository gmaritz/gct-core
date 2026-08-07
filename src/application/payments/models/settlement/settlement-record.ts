import { createSettlementReference, SettlementReference } from "./settlement-reference";
import { SettlementStatus } from "./settlement-status";

export interface SettlementRecord {
  readonly reference: SettlementReference;
  readonly settledAt: Date;
  readonly amount: number;
  readonly currency: string;
  readonly status: SettlementStatus;
}

export function createSettlementRecord(record: SettlementRecord): SettlementRecord {
  return Object.freeze({
    reference: createSettlementReference(record.reference),
    settledAt: new Date(record.settledAt.getTime()),
    amount: record.amount,
    currency: record.currency,
    status: record.status,
  });
}
