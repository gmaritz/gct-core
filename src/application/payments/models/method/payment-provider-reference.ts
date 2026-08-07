export interface PaymentProviderReference {
  readonly providerIdentifier: string;
  readonly reference: string;
  readonly correlationId?: string;
}

export function createPaymentProviderReference(
  reference: PaymentProviderReference,
): PaymentProviderReference {
  return Object.freeze({
    providerIdentifier: reference.providerIdentifier,
    reference: reference.reference,
    correlationId: reference.correlationId,
  });
}
