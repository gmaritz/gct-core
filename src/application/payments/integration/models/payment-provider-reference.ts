import {
  PaymentProviderReference as CorePaymentProviderReference,
  createPaymentProviderReference as createCorePaymentProviderReference,
} from "../../models";

export type PaymentGatewayProviderReference = CorePaymentProviderReference;

export function createPaymentGatewayProviderReference(
  reference: PaymentGatewayProviderReference,
): PaymentGatewayProviderReference {
  return createCorePaymentProviderReference(reference);
}
