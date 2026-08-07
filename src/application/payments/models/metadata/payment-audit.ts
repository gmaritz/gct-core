export interface PaymentAudit {
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly traceId?: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
}

export function createPaymentAudit(audit: PaymentAudit): PaymentAudit {
  return Object.freeze({
    correlationId: audit.correlationId,
    requestId: audit.requestId,
    traceId: audit.traceId,
    createdBy: audit.createdBy,
    updatedBy: audit.updatedBy,
  });
}
