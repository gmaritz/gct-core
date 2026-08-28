import {
  AuthorizationStatus,
  CaptureStatus,
  PaymentStatus,
  SettlementStatus,
  TransactionReference,
} from "../../models";
import { PaymentProviderOperation } from "./payment-provider-operation";
import { PaymentGatewayProviderReference } from "./payment-provider-reference";

export interface PaymentGatewayResultMetadata {
  readonly completedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly source: string;
  readonly operation: PaymentProviderOperation;
}

export interface HostedPaymentAction {
  readonly method: "GET" | "POST";
  readonly action: string;
  readonly fields: Readonly<Record<string, string>>;
}

export interface PaymentGatewayResult {
  readonly success: boolean;
  readonly providerReference: PaymentGatewayProviderReference | null;
  readonly transactionReference: TransactionReference | null;
  readonly authorizationStatus: AuthorizationStatus | null;
  readonly captureStatus: CaptureStatus | null;
  readonly settlementStatus: SettlementStatus | null;
  readonly paymentStatus: PaymentStatus | null;
  readonly hostedPaymentAction?: HostedPaymentAction;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: PaymentGatewayResultMetadata;
}

export function createPaymentGatewayResult(result: PaymentGatewayResult): PaymentGatewayResult {
  return Object.freeze({
    success: result.success,
    providerReference: result.providerReference
      ? Object.freeze({
          providerIdentifier: result.providerReference.providerIdentifier,
          reference: result.providerReference.reference,
          correlationId: result.providerReference.correlationId,
        })
      : null,
    transactionReference: result.transactionReference
      ? Object.freeze({
          transactionId: result.transactionReference.transactionId,
          providerCorrelationId: result.transactionReference.providerCorrelationId,
          customerReference: result.transactionReference.customerReference,
        })
      : null,
    authorizationStatus: result.authorizationStatus ?? null,
    captureStatus: result.captureStatus ?? null,
    settlementStatus: result.settlementStatus ?? null,
    paymentStatus: result.paymentStatus ?? null,
    hostedPaymentAction: result.hostedPaymentAction
      ? Object.freeze({
          method: result.hostedPaymentAction.method,
          action: result.hostedPaymentAction.action,
          fields: Object.freeze({ ...result.hostedPaymentAction.fields }),
        })
      : undefined,
    warnings: Object.freeze([...(result.warnings ?? [])]),
    metadata: Object.freeze({
      completedAt: new Date(result.metadata.completedAt.getTime()),
      version: result.metadata.version,
      requestId: result.metadata.requestId,
      source: result.metadata.source,
      operation: result.metadata.operation,
    }),
  });
}
