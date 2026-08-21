import { PaymentEngineResult } from "../engine";
import { Payment } from "../aggregate/payment";
import { PaymentStatus } from "../models";
import {
  createPaymentGatewayRequest,
  createPaymentGatewayResult,
  createPaymentProviderContext,
  PaymentGatewayResult,
  PaymentProviderOperation,
} from "./models";
import { PaymentGateway } from "./payment-gateway";
import { PaymentGatewayProviderReference } from "./models/payment-provider-reference";

export interface PaymentProviderIntegrationRequest {
  readonly engineResult: PaymentEngineResult;
  readonly providerReference: PaymentGatewayProviderReference;
  readonly amount?: number;
}

function collectWarnings(engineResult: PaymentEngineResult): ReadonlyArray<string> {
  return Object.freeze([
    ...(engineResult.validationResult.warnings ?? []),
    ...(engineResult.policyEvaluation?.warnings ?? []),
    ...(engineResult.processingResult?.warnings ?? []),
  ]);
}

function deriveRequestId(engineResult: PaymentEngineResult): string {
  return engineResult.metadata.requestId;
}

function deriveSource(engineResult: PaymentEngineResult): string {
  return engineResult.metadata.source;
}

function createBusinessFailureResult(
  engineResult: PaymentEngineResult,
  providerReference: PaymentGatewayProviderReference,
  operation: PaymentProviderOperation,
): PaymentGatewayResult {
  return createPaymentGatewayResult({
    success: false,
    providerReference,
    transactionReference: null,
    authorizationStatus: null,
    captureStatus: null,
    settlementStatus: null,
    paymentStatus: engineResult.payment?.status ?? null,
    warnings: collectWarnings(engineResult),
    metadata: {
      completedAt: new Date(),
      version: "1.0.0",
      requestId: deriveRequestId(engineResult),
      source: deriveSource(engineResult),
      operation,
    },
  });
}

function buildGatewayContext(
  payment: Payment,
  providerReference: PaymentGatewayProviderReference,
  operation: PaymentProviderOperation,
  amount: number,
  engineResult: PaymentEngineResult,
): ReturnType<typeof createPaymentProviderContext> {
  const gatewayRequest = createPaymentGatewayRequest({
    paymentReference: payment.reference,
    reservationReference: payment.reservationSnapshot.reservationReference,
    providerReference,
    operation,
    paymentMethod: payment.paymentMethod,
    currency: payment.currency,
    amount,
    metadata: {
      requestedAt: new Date(),
      version: "1.0.0",
      requestId: deriveRequestId(engineResult),
      source: deriveSource(engineResult),
    },
  });

  return createPaymentProviderContext({
    paymentAggregate: payment,
    gatewayRequest,
    operation,
    metadata: {
      startedAt: new Date(),
      version: "1.0.0",
      requestId: deriveRequestId(engineResult),
      source: deriveSource(engineResult),
    },
  });
}

export class PaymentProviderIntegrationService {
  public constructor(private readonly gateway: PaymentGateway) {}

  public async authorize(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult> {
    return this.execute(PaymentProviderOperation.AUTHORIZE, request, request.amount ?? request.engineResult.payment?.paymentAmount);
  }

  public async capture(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult> {
    return this.execute(PaymentProviderOperation.CAPTURE, request, request.amount ?? request.engineResult.payment?.paymentAmount);
  }

  public async settle(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult> {
    return this.execute(PaymentProviderOperation.SETTLE, request, request.amount ?? request.engineResult.payment?.paymentAmount);
  }

  public async refund(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult> {
    return this.execute(PaymentProviderOperation.REFUND, request, request.amount ?? request.engineResult.payment?.paymentAmount);
  }

  public async status(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult> {
    return this.execute(PaymentProviderOperation.STATUS, request, request.amount ?? request.engineResult.payment?.paymentAmount);
  }

  private async execute(
    operation: PaymentProviderOperation,
    request: PaymentProviderIntegrationRequest,
    amount: number | undefined,
  ): Promise<PaymentGatewayResult> {
    const { engineResult, providerReference } = request;

    if (!engineResult.success || !engineResult.payment) {
      return createBusinessFailureResult(engineResult, providerReference, operation);
    }

    const payment = engineResult.payment;
    const effectiveAmount = typeof amount === "number" ? amount : payment.paymentAmount;
    const context = buildGatewayContext(payment, providerReference, operation, effectiveAmount, engineResult);
    const gatewayResult = await this.gateway.execute(context);

    return createPaymentGatewayResult({
      success: gatewayResult.success,
      providerReference: gatewayResult.providerReference ?? providerReference,
      transactionReference: gatewayResult.transactionReference,
      authorizationStatus: gatewayResult.authorizationStatus,
      captureStatus: gatewayResult.captureStatus,
      settlementStatus: gatewayResult.settlementStatus,
      paymentStatus: gatewayResult.paymentStatus ?? payment.status ?? PaymentStatus.CREATED,
      warnings: [...engineResult.validationResult.warnings, ...(engineResult.policyEvaluation?.warnings ?? []), ...(engineResult.processingResult?.warnings ?? []), ...gatewayResult.warnings],
      metadata: {
        completedAt: new Date(),
        version: "1.0.0",
        requestId: deriveRequestId(engineResult),
        source: deriveSource(engineResult),
        operation,
      },
    });
  }
}
