import { PaymentMethod, PaymentReference } from "../../models";
import { PaymentProviderOperation } from "./payment-provider-operation";
import { PaymentGatewayProviderReference } from "./payment-provider-reference";

export interface PaymentGatewayRequestMetadata {
  readonly requestedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly source: string;
}

export interface PaymentGatewayRequest {
  readonly paymentReference: PaymentReference;
  readonly reservationReference: string;
  readonly providerReference: PaymentGatewayProviderReference;
  readonly operation: PaymentProviderOperation;
  readonly paymentMethod: PaymentMethod;
  readonly currency: string;
  readonly amount: number;
  readonly metadata: PaymentGatewayRequestMetadata;
}

export function createPaymentGatewayRequest(request: PaymentGatewayRequest): PaymentGatewayRequest {
  return Object.freeze({
    paymentReference: Object.freeze({
      paymentId: request.paymentReference.paymentId,
      reservationId: request.paymentReference.reservationId,
      quotationNumber: request.paymentReference.quotationNumber,
    }),
    reservationReference: request.reservationReference,
    providerReference: Object.freeze({
      providerIdentifier: request.providerReference.providerIdentifier,
      reference: request.providerReference.reference,
      correlationId: request.providerReference.correlationId,
    }),
    operation: request.operation,
    paymentMethod: request.paymentMethod,
    currency: request.currency,
    amount: request.amount,
    metadata: Object.freeze({
      requestedAt: new Date(request.metadata.requestedAt.getTime()),
      version: request.metadata.version,
      requestId: request.metadata.requestId,
      source: request.metadata.source,
    }),
  });
}
