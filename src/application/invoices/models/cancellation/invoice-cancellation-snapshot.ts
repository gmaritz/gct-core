export interface InvoiceCancellationSnapshot {
  readonly policyReference: string;
  readonly policyVersion?: string;
  readonly effectiveFrom?: Date;
  readonly effectiveTo?: Date;
  readonly cancellationDate: Date;
  readonly cancellationCharge: number;
  readonly refundableAmount: number;
}

export function createInvoiceCancellationSnapshot(
  snapshot: InvoiceCancellationSnapshot,
): InvoiceCancellationSnapshot {
  return Object.freeze({
    policyReference: snapshot.policyReference,
    policyVersion: snapshot.policyVersion,
    effectiveFrom: typeof snapshot.effectiveFrom === "undefined" ? undefined : new Date(snapshot.effectiveFrom.getTime()),
    effectiveTo: typeof snapshot.effectiveTo === "undefined" ? undefined : new Date(snapshot.effectiveTo.getTime()),
    cancellationDate: new Date(snapshot.cancellationDate.getTime()),
    cancellationCharge: snapshot.cancellationCharge,
    refundableAmount: snapshot.refundableAmount,
  });
}