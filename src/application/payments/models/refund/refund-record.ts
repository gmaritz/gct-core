import { createPaymentProviderReference, PaymentProviderReference } from "../method";
import { RefundStatus } from "./refund-status";

export interface RefundRecord {
  readonly refundId: string;
  readonly requestedAt: Date;
  readonly refundedAt?: Date;
  readonly amount: number;
  readonly currency: string;
  readonly reason: string;
  readonly status: RefundStatus;
  readonly providerReference: PaymentProviderReference;
}

export function createRefundRecord(record: RefundRecord): RefundRecord {
  return Object.freeze({
    refundId: record.refundId,
    requestedAt: new Date(record.requestedAt.getTime()),
    refundedAt: typeof record.refundedAt === "undefined" ? undefined : new Date(record.refundedAt.getTime()),
    amount: record.amount,
    currency: record.currency,
    reason: record.reason,
    status: record.status,
    providerReference: createPaymentProviderReference(record.providerReference),
  });
}
