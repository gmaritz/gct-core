import { createPaymentAudit, PaymentAudit } from "./payment-audit";

export interface PaymentMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
  readonly source: string;
  readonly audit?: PaymentAudit;
}

export function createPaymentMetadata(metadata: PaymentMetadata): PaymentMetadata {
  return Object.freeze({
    createdAt: new Date(metadata.createdAt.getTime()),
    updatedAt: new Date(metadata.updatedAt.getTime()),
    version: metadata.version,
    source: metadata.source,
    audit: metadata.audit ? createPaymentAudit(metadata.audit) : undefined,
  });
}
