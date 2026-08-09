export interface InvoicePricingSnapshot {
  readonly snapshotId: string;
  readonly pricingId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly currency: string;
  readonly totalAmount: number;
}

export function createInvoicePricingSnapshot(snapshot: InvoicePricingSnapshot): InvoicePricingSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    pricingId: snapshot.pricingId,
    capturedAt: new Date(snapshot.capturedAt.getTime()),
    version: snapshot.version,
    currency: snapshot.currency,
    totalAmount: snapshot.totalAmount,
  });
}