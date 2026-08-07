import { Payment } from "../../aggregate";
import { PaymentGatewayRequest } from "./payment-gateway-request";
import { PaymentProviderOperation } from "./payment-provider-operation";

export interface PaymentProviderContextMetadata {
  readonly startedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly source: string;
}

export interface PaymentProviderContext {
  readonly paymentAggregate: Payment;
  readonly gatewayRequest: PaymentGatewayRequest;
  readonly operation: PaymentProviderOperation;
  readonly metadata: PaymentProviderContextMetadata;
}

export function createPaymentProviderContext(context: PaymentProviderContext): PaymentProviderContext {
  return Object.freeze({
    paymentAggregate: context.paymentAggregate,
    gatewayRequest: context.gatewayRequest,
    operation: context.operation,
    metadata: Object.freeze({
      startedAt: new Date(context.metadata.startedAt.getTime()),
      version: context.metadata.version,
      requestId: context.metadata.requestId,
      source: context.metadata.source,
    }),
  });
}
