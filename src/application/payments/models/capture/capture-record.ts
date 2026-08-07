import { createPaymentProviderReference, PaymentProviderReference } from "../method";
import { CaptureStatus } from "./capture-status";

export interface CaptureRecord {
  readonly captureId: string;
  readonly capturedAt: Date;
  readonly amount: number;
  readonly currency: string;
  readonly providerReference: PaymentProviderReference;
  readonly status: CaptureStatus;
}

export function createCaptureRecord(record: CaptureRecord): CaptureRecord {
  return Object.freeze({
    captureId: record.captureId,
    capturedAt: new Date(record.capturedAt.getTime()),
    amount: record.amount,
    currency: record.currency,
    providerReference: createPaymentProviderReference(record.providerReference),
    status: record.status,
  });
}
