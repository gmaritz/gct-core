export interface InvoiceAdjustment {
  readonly id: string;
  readonly type: string;
  readonly amount: number;
  readonly reason: string;
  readonly appliedAt: Date;
}

export function createInvoiceAdjustment(adjustment: InvoiceAdjustment): InvoiceAdjustment {
  return Object.freeze({
    id: adjustment.id,
    type: adjustment.type,
    amount: adjustment.amount,
    reason: adjustment.reason,
    appliedAt: new Date(adjustment.appliedAt.getTime()),
  });
}