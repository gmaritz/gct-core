import {
  AuthorizationStatus,
  CaptureStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  SettlementStatus,
  createPaymentEngineResult,
  createPaymentEvent,
  createPaymentProcessingContext,
  createPaymentProcessingResult,
  createPaymentStageProcessingResult,
  createPaymentState,
  createPaymentValidationError,
  createPaymentValidationResult,
  PaymentEventType,
  PaymentProcessingStage,
  PaymentProcessingStatus,
  PaymentValidationErrorCode,
  PaymentValidationStage,
} from "@application/payments";
import {
  PaymentGateway,
  PaymentGatewayResult,
  PaymentProviderContext,
  PaymentProviderOperation,
  PaymentProviderIntegrationService,
  createPaymentGatewayRequest,
  createPaymentGatewayResult,
  createPaymentProviderContext,
  createPaymentGatewayProviderReference,
} from "@application/payments/integration";
import { PaymentPolicyOutcome, PaymentPolicyPriority } from "@application/payments/policies";

function createPaymentAggregate(): Payment {
  return Payment.create({
    reference: {
      paymentId: "payment-8001",
      reservationId: "reservation-8001",
    },
    reservationSnapshot: {
      snapshotId: "reservation-snap-8001",
      capturedAt: new Date("2026-08-07T16:00:00.000Z"),
      version: "1.0.0",
      reservationId: "reservation-8001",
      reservationReference: "RES-8001",
    },
    pricingSnapshot: {
      snapshotId: "pricing-snap-8001",
      capturedAt: new Date("2026-08-07T16:01:00.000Z"),
      version: "1.0.0",
      pricingId: "pricing-8001",
      subtotal: 25000,
      taxes: 3000,
      discounts: 1000,
      fees: 200,
      total: 27200,
      currency: "ZAR",
    },
    paymentAmount: 27200,
    currency: "ZAR",
    paymentMethod: PaymentMethod.CARD,
    paymentInstrument: {
      instrumentType: "CARD",
      maskedIdentifier: "**** 4242",
      holderName: "Alex Traveller",
      expiryMonth: 12,
      expiryYear: 2030,
    },
    status: PaymentStatus.CREATED,
    authorization: {
      authorizationId: "auth-8001",
      authorizedAt: new Date("2026-08-07T16:02:00.000Z"),
      amount: 27200,
      currency: "ZAR",
      providerReference: {
        providerIdentifier: "provider-a",
        reference: "AUTH-8001",
      },
      status: AuthorizationStatus.APPROVED,
    },
    capture: {
      captureId: "capture-8001",
      capturedAt: new Date("2026-08-07T16:03:00.000Z"),
      amount: 27200,
      currency: "ZAR",
      providerReference: {
        providerIdentifier: "provider-a",
        reference: "CAP-8001",
      },
      status: CaptureStatus.CAPTURED,
    },
    settlement: {
      reference: {
        settlementId: "settle-8001",
        providerReference: {
          providerIdentifier: "provider-a",
          reference: "SET-8001",
        },
      },
      settledAt: new Date("2026-08-07T16:04:00.000Z"),
      amount: 27200,
      currency: "ZAR",
      status: SettlementStatus.SETTLED,
    },
    refunds: [
      {
        refundId: "refund-8001",
        requestedAt: new Date("2026-08-07T16:05:00.000Z"),
        refundedAt: new Date("2026-08-07T16:06:00.000Z"),
        amount: 1200,
        currency: "ZAR",
        reason: "Adjustment",
        status: RefundStatus.REFUNDED,
        providerReference: {
          providerIdentifier: "provider-a",
          reference: "REF-8001",
        },
      },
    ],
    timeline: [
      createPaymentEvent({
        eventType: PaymentEventType.PAYMENT_CREATED,
        occurredAt: new Date("2026-08-07T16:00:00.000Z"),
      }),
      createPaymentEvent({
        eventType: PaymentEventType.CAPTURE_COMPLETED,
        occurredAt: new Date("2026-08-07T16:03:00.000Z"),
      }),
    ],
    metadata: {
      createdAt: new Date("2026-08-07T16:00:00.000Z"),
      updatedAt: new Date("2026-08-07T16:06:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createEngineResult(success = true): ReturnType<typeof createPaymentEngineResult> {
  const payment = success ? createPaymentAggregate() : null;

  return createPaymentEngineResult({
    success,
    payment,
    validationResult: createPaymentValidationResult({
      stage: PaymentValidationStage.REQUEST,
      errors: success
        ? []
        : [
            createPaymentValidationError({
              stage: PaymentValidationStage.REQUEST,
              code: PaymentValidationErrorCode.MISSING_REQUEST,
              message: "validation failed",
              severity: "CRITICAL",
            }),
          ],
      warnings: success ? ["validation warning"] : ["validation warning"],
      metadata: {
        validatedAt: new Date("2026-08-07T16:07:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    }),
    policyEvaluation: success
      ? {
          permitted: true,
          outcome: PaymentPolicyOutcome.ALLOW,
          priority: PaymentPolicyPriority.NORMAL,
          requiredActions: [],
          policyResults: [],
          warnings: ["policy warning"],
          metadata: {
            evaluatedAt: new Date("2026-08-07T16:07:00.000Z"),
            version: "1.0.0",
            source: "test",
          },
        }
      : undefined,
    processingResult: success
      ? createPaymentProcessingResult({
          success: true,
          stageResults: [
            createPaymentStageProcessingResult({
              processorName: "completion",
              stage: PaymentProcessingStage.COMPLETION,
              status: PaymentProcessingStatus.COMPLETED,
              context: createPaymentProcessingContext({
                paymentSnapshot: createPaymentState({
                  reference: createPaymentAggregate().reference,
                  reservationSnapshot: createPaymentAggregate().reservationSnapshot,
                  pricingSnapshot: createPaymentAggregate().pricingSnapshot,
                  paymentAmount: createPaymentAggregate().paymentAmount,
                  currency: createPaymentAggregate().currency,
                  paymentMethod: createPaymentAggregate().paymentMethod,
                  status: PaymentStatus.CREATED,
                  refunds: [],
                }),
                reservationSnapshot: createPaymentAggregate().reservationSnapshot,
                pricingSnapshot: createPaymentAggregate().pricingSnapshot,
                paymentMethod: createPaymentAggregate().paymentMethod,
                processingMetadata: createPaymentAggregate().metadata,
              }),
              warnings: ["processing warning"],
              metadata: {
                processedAt: new Date("2026-08-07T16:08:00.000Z"),
                version: "1.0.0",
                source: "test",
              },
            }),
          ],
          finalContext: createPaymentProcessingContext({
            paymentSnapshot: createPaymentState({
              reference: createPaymentAggregate().reference,
              reservationSnapshot: createPaymentAggregate().reservationSnapshot,
              pricingSnapshot: createPaymentAggregate().pricingSnapshot,
              paymentAmount: createPaymentAggregate().paymentAmount,
              currency: createPaymentAggregate().currency,
              paymentMethod: createPaymentAggregate().paymentMethod,
              status: PaymentStatus.CREATED,
              refunds: [],
            }),
            reservationSnapshot: createPaymentAggregate().reservationSnapshot,
            pricingSnapshot: createPaymentAggregate().pricingSnapshot,
            paymentMethod: createPaymentAggregate().paymentMethod,
            processingMetadata: createPaymentAggregate().metadata,
          }),
          warnings: ["processing warning"],
          metadata: {
            processedAt: new Date("2026-08-07T16:08:00.000Z"),
            version: "1.0.0",
            source: "test",
          },
        })
      : undefined,
    metadata: {
      completedAt: new Date("2026-08-07T16:09:00.000Z"),
      version: "1.0.0",
      requestId: "payment-request-8001",
      source: "test",
      stages: ["CONTEXT", "VALIDATION", "POLICY", "PROCESSING", "AGGREGATE"],
      pending: false,
    },
  });
}

function createGatewayResult(overrides?: Partial<PaymentGatewayResult>): PaymentGatewayResult {
  return createPaymentGatewayResult({
    success: overrides?.success ?? true,
    providerReference:
      overrides?.providerReference ?? createPaymentGatewayProviderReference({ providerIdentifier: "provider-a", reference: "GW-8001" }),
    transactionReference:
      overrides?.transactionReference ?? {
        transactionId: "txn-8001",
        providerCorrelationId: "corr-8001",
        customerReference: "customer-8001",
      },
    authorizationStatus: overrides?.authorizationStatus ?? AuthorizationStatus.APPROVED,
    captureStatus: overrides?.captureStatus ?? CaptureStatus.CAPTURED,
    settlementStatus: overrides?.settlementStatus ?? SettlementStatus.SETTLED,
    paymentStatus: overrides?.paymentStatus ?? PaymentStatus.COMPLETED,
    warnings: overrides?.warnings ?? ["gateway warning"],
    metadata: {
      completedAt: new Date("2026-08-07T16:10:00.000Z"),
      version: "1.0.0",
      requestId: "payment-request-8001",
      source: "gateway-test",
      operation: PaymentProviderOperation.STATUS,
    },
  });
}

describe("PaymentProviderIntegrationService", () => {
  it("supports authorize, capture, settle, refund and status operations", async () => {
    const seenOperations: PaymentProviderOperation[] = [];
    const seenContexts: PaymentProviderContext[] = [];
    const gateway: PaymentGateway = {
      execute: async (context) => {
        seenOperations.push(context.operation);
        seenContexts.push(context);
        return createGatewayResult({
          metadata: {
            completedAt: new Date("2026-08-07T16:11:00.000Z"),
            version: "1.0.0",
            requestId: context.metadata.requestId,
            source: context.metadata.source,
            operation: context.operation,
          },
        });
      },
    };

    const service = new PaymentProviderIntegrationService(gateway);
    const request = {
      engineResult: createEngineResult(true),
      providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "provider-a", reference: "GW-8001" }),
    };

    const authorize = await service.authorize(request);
    const capture = await service.capture(request);
    const settle = await service.settle(request);
    const refund = await service.refund(request);
    const status = await service.status(request);

    expect(seenOperations).toEqual([
      PaymentProviderOperation.AUTHORIZE,
      PaymentProviderOperation.CAPTURE,
      PaymentProviderOperation.SETTLE,
      PaymentProviderOperation.REFUND,
      PaymentProviderOperation.STATUS,
    ]);
    expect(seenContexts[0].gatewayRequest.operation).toBe(PaymentProviderOperation.AUTHORIZE);
    expect(authorize.success).toBe(true);
    expect(capture.success).toBe(true);
    expect(settle.success).toBe(true);
    expect(refund.success).toBe(true);
    expect(status.success).toBe(true);
    expect(Object.isFrozen(authorize)).toBe(true);
    expect(Object.isFrozen(authorize.metadata)).toBe(true);
  });

  it("returns business failure result without invoking gateway when engine result is unsuccessful", async () => {
    let called = false;
    const gateway: PaymentGateway = {
      execute: async () => {
        called = true;
        return createGatewayResult();
      },
    };

    const service = new PaymentProviderIntegrationService(gateway);
    const result = await service.authorize({
      engineResult: createEngineResult(false),
      providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "provider-a", reference: "GW-8001" }),
    });

    expect(called).toBe(false);
    expect(result.success).toBe(false);
    expect(result.paymentStatus).toBeNull();
    expect(result.warnings).toContain("validation warning");
  });

  it("propagates technical exceptions from gateway", async () => {
    const gateway: PaymentGateway = {
      execute: async () => {
        throw new Error("gateway failure");
      },
    };

    const service = new PaymentProviderIntegrationService(gateway);

    await expect(
      service.status({
        engineResult: createEngineResult(true),
        providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "provider-a", reference: "GW-8001" }),
      }),
    ).rejects.toThrow("gateway failure");
  });
});

describe("Payment gateway contracts", () => {
  it("creates immutable request, context and result contracts", () => {
    const payment = createPaymentAggregate();
    const request = createPaymentGatewayRequest({
      paymentReference: payment.reference,
      reservationReference: payment.reservationSnapshot.reservationReference,
      providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "provider-a", reference: "GW-8001" }),
      operation: PaymentProviderOperation.AUTHORIZE,
      paymentMethod: payment.paymentMethod,
      currency: payment.currency,
      amount: payment.paymentAmount,
      metadata: {
        requestedAt: new Date("2026-08-07T16:12:00.000Z"),
        version: "1.0.0",
        requestId: "payment-request-8001",
        source: "test",
      },
    });

    const context = createPaymentProviderContext({
      paymentAggregate: payment,
      gatewayRequest: request,
      operation: PaymentProviderOperation.AUTHORIZE,
      metadata: {
        startedAt: new Date("2026-08-07T16:12:00.000Z"),
        version: "1.0.0",
        requestId: "payment-request-8001",
        source: "test",
      },
    });

    const result = createPaymentGatewayResult({
      success: true,
      providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "provider-a", reference: "GW-8001" }),
      transactionReference: {
        transactionId: "txn-8001",
        providerCorrelationId: "corr-8001",
        customerReference: "customer-8001",
      },
      authorizationStatus: AuthorizationStatus.APPROVED,
      captureStatus: CaptureStatus.CAPTURED,
      settlementStatus: SettlementStatus.SETTLED,
      paymentStatus: PaymentStatus.COMPLETED,
      warnings: ["gateway warning"],
      metadata: {
        completedAt: new Date("2026-08-07T16:13:00.000Z"),
        version: "1.0.0",
        requestId: "payment-request-8001",
        source: "test",
        operation: PaymentProviderOperation.AUTHORIZE,
      },
    });

    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });
});
