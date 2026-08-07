import { createPaymentProviderReference, PaymentProviderReference } from "../method";

export interface SettlementReference {
  readonly settlementId: string;
  readonly batchReference?: string;
  readonly providerReference: PaymentProviderReference;
}

export function createSettlementReference(reference: SettlementReference): SettlementReference {
  return Object.freeze({
    settlementId: reference.settlementId,
    batchReference: reference.batchReference,
    providerReference: createPaymentProviderReference(reference.providerReference),
  });
}
