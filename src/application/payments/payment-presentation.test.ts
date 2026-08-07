import {
  AuthorizationStatus,
  CaptureStatus,
  createPaymentEvent,
  createPaymentEngineResult,
  createPaymentPolicyResult,
  createPaymentProcessingContext,
  createPaymentProcessingResult,
  createPaymentStageProcessingResult,
  createPaymentState,
  createPaymentValidationResult,
  Payment,
  PaymentEventType,
  PaymentMethod,
  PaymentPolicyOutcome,
  PaymentPolicyPriority,
  PaymentProcessingStage,
  PaymentProcessingStatus,
  PaymentRequiredAction,
  RefundStatus,
  SettlementStatus,
  PaymentStatus,
  PaymentValidationStage,
} from "@application/payments";
import { PaymentPolicyEvaluation } from "@application/payments/policies";
import {
  createPaymentLifecyclePresentationModel,
  createPaymentStatusPresentationModel,
  createPaymentSummaryPresentationModel,
  createPaymentViewModel,
  PaymentLifecyclePresentationModel,
  PaymentPresentationMapper,
  PaymentStatusPresentationModel,
  PaymentSummaryPresentationModel,
  PaymentViewModelProvider,
} from "@application/payments/presentation";

function createPaymentAggregate(withOptionals = true): Payment {
  return Payment.create({
    reference: {
      paymentId: "payment-7001",
      reservationId: "reservation-7001",
    },
    reservationSnapshot: {
      snapshotId: "reservation-snap-7001",
      capturedAt: new Date("2026-08-07T15:00:00.000Z"),
      version: "1.0.0",
      reservationId: "reservation-7001",
      reservationReference: "RES-7001",
    },
    pricingSnapshot: {
      snapshotId: "pricing-snap-7001",
      capturedAt: new Date("2026-08-07T15:01:00.000Z"),
      version: "1.0.0",
      pricingId: "pricing-7001",
      subtotal: 42000,
      taxes: 5000,
      discounts: 2000,
      fees: 400,
      total: 45400,
      currency: "ZAR",
    },
    paymentAmount: 45400,
    currency: "ZAR",
    paymentMethod: PaymentMethod.CARD,
    paymentInstrument: withOptionals
      ? {
          instrumentType: "CARD",
          maskedIdentifier: "**** 4242",
          holderName: "Alex Traveller",
          expiryMonth: 12,
          expiryYear: 2030,
        }
      : undefined,
    status: withOptionals ? PaymentStatus.COMPLETED : PaymentStatus.CREATED,
    authorization: withOptionals
      ? {
          authorizationId: "auth-7001",
          authorizedAt: new Date("2026-08-07T15:05:00.000Z"),
          amount: 45400,
          currency: "ZAR",
          providerReference: {
            providerIdentifier: "provider-a",
            reference: "AUTH-7001",
          },
          status: AuthorizationStatus.APPROVED,
        }
      : undefined,
    capture: withOptionals
      ? {
          captureId: "capture-7001",
          capturedAt: new Date("2026-08-07T15:06:00.000Z"),
          amount: 45400,
          currency: "ZAR",
          providerReference: {
            providerIdentifier: "provider-a",
            reference: "CAP-7001",
          },
          status: CaptureStatus.CAPTURED,
        }
      : undefined,
    settlement: withOptionals
      ? {
          reference: {
            settlementId: "settle-7001",
            providerReference: {
              providerIdentifier: "provider-a",
              reference: "SET-7001",
            },
          },
          settledAt: new Date("2026-08-07T15:07:00.000Z"),
          amount: 45400,
          currency: "ZAR",
          status: SettlementStatus.SETTLED,
        }
      : undefined,
    refunds: withOptionals
      ? [
          {
            refundId: "refund-7001",
            requestedAt: new Date("2026-08-07T15:08:00.000Z"),
            refundedAt: new Date("2026-08-07T15:09:00.000Z"),
            amount: 1500,
            currency: "ZAR",
            reason: "Adjustment",
            status: RefundStatus.REFUNDED,
            providerReference: {
              providerIdentifier: "provider-a",
              reference: "REF-7001",
            },
          },
        ]
      : [],
    timeline: [
      createPaymentEvent({
        eventType: PaymentEventType.PAYMENT_CREATED,
        occurredAt: new Date("2026-08-07T15:00:00.000Z"),
        note: "Payment created",
      }),
      createPaymentEvent({
        eventType: PaymentEventType.CAPTURE_COMPLETED,
        occurredAt: new Date("2026-08-07T15:06:00.000Z"),
        note: "Capture complete",
      }),
    ],
    metadata: {
      createdAt: new Date("2026-08-07T15:00:00.000Z"),
      updatedAt: new Date("2026-08-07T15:10:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPolicyEvaluation(): PaymentPolicyEvaluation {
  return Object.freeze({
    permitted: true,
    outcome: PaymentPolicyOutcome.ALLOW,
    priority: PaymentPolicyPriority.NORMAL,
    requiredActions: Object.freeze([PaymentRequiredAction.MANUAL_APPROVAL]),
    policyResults: Object.freeze([
      createPaymentPolicyResult({
        policyName: "risk",
        outcome: PaymentPolicyOutcome.ALLOW,
        priority: PaymentPolicyPriority.NORMAL,
        warnings: ["policy warning"],
        metadata: {
          evaluatedAt: new Date("2026-08-07T15:11:00.000Z"),
          version: "1.0.0",
          source: "test",
        },
      }),
    ]),
    warnings: Object.freeze(["policy warning"]),
    metadata: Object.freeze({
      evaluatedAt: new Date("2026-08-07T15:11:00.000Z"),
      version: "1.0.0",
      source: "test",
    }),
  });
}

function createProcessingResult(): ReturnType<typeof createPaymentProcessingResult> {
  const payment = createPaymentAggregate();

  const stage = createPaymentStageProcessingResult({
    processorName: "completion",
    stage: PaymentProcessingStage.COMPLETION,
    status: PaymentProcessingStatus.COMPLETED,
    context: createPaymentProcessingContext({
      paymentSnapshot: createPaymentState({
        reference: payment.reference,
        reservationSnapshot: payment.reservationSnapshot,
        pricingSnapshot: payment.pricingSnapshot,
        paymentAmount: payment.paymentAmount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: PaymentStatus.COMPLETED,
        refunds: payment.refunds,
      }),
      reservationSnapshot: payment.reservationSnapshot,
      pricingSnapshot: payment.pricingSnapshot,
      paymentMethod: payment.paymentMethod,
      processingMetadata: payment.metadata,
    }),
    warnings: ["processing warning"],
    metadata: {
      processedAt: new Date("2026-08-07T15:12:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });

  return createPaymentProcessingResult({
    success: true,
    stageResults: [stage],
    finalContext: stage.context,
    warnings: ["processing warning"],
    metadata: {
      processedAt: new Date("2026-08-07T15:12:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createEngineResult(overrides?: {
  success?: boolean;
  payment?: Payment | null;
  pending?: boolean;
}) {
  const baseValidation = createPaymentValidationResult({
    stage: PaymentValidationStage.REQUEST,
    errors: [],
    warnings: ["validation warning"],
    metadata: {
      validatedAt: new Date("2026-08-07T15:10:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });

  return createPaymentEngineResult({
    success: overrides?.success ?? true,
    payment: typeof overrides?.payment === "undefined" ? createPaymentAggregate() : overrides.payment,
    validationResult: baseValidation,
    policyEvaluation: createPolicyEvaluation(),
    processingResult: createProcessingResult(),
    metadata: {
      completedAt: new Date("2026-08-07T15:13:00.000Z"),
      version: "1.0.0",
      requestId: "payment-request-7001",
      source: "test",
      stages: ["CONTEXT", "VALIDATION", "POLICY", "PROCESSING", "AGGREGATE"],
      pending: overrides?.pending ?? false,
    },
  });
}

describe("PaymentPresentationMapper", () => {
  it("maps successful payment engine results to presentation models", () => {
    const mapper = new PaymentPresentationMapper();
    const output = mapper.map(createEngineResult());

    expect(output).not.toBeNull();
    expect(output?.summary.paymentReference).toBe("payment-7001");
    expect(output?.summary.traveller).toBe("Alex Traveller");
    expect(output?.lifecycle.authorizationStatus).toBe("APPROVED");
    expect(output?.lifecycle.captureStatus).toBe("CAPTURED");
    expect(output?.lifecycle.settlementStatus).toBe("SETTLED");
    expect(output?.lifecycle.refundStatus).toBe("REFUNDED");
    expect(output?.status.headline).toBe("Payment ready");
    expect(Object.isFrozen(output)).toBe(true);
    expect(Object.isFrozen(output?.summary)).toBe(true);
    expect(Object.isFrozen(output?.lifecycle)).toBe(true);
    expect(Object.isFrozen(output?.status)).toBe(true);
  });

  it("returns null when payment engine result is unsuccessful", () => {
    const mapper = new PaymentPresentationMapper();

    const output = mapper.map(createEngineResult({ success: false, payment: null }));

    expect(output).toBeNull();
  });

  it("applies optional defaults and lifecycle defaults", () => {
    const mapper = new PaymentPresentationMapper();
    const output = mapper.map(createEngineResult({ payment: createPaymentAggregate(false) }));

    expect(output?.summary.traveller).toBe("Traveller pending");
    expect(output?.lifecycle.authorizationStatus).toBe("NOT_STARTED");
    expect(output?.lifecycle.captureStatus).toBe("NOT_STARTED");
    expect(output?.lifecycle.settlementStatus).toBe("NOT_STARTED");
    expect(output?.lifecycle.refundStatus).toBe("NOT_STARTED");
  });

  it("maps pending status model when metadata indicates pending", () => {
    const mapper = new PaymentPresentationMapper();
    const output = mapper.map(createEngineResult({ pending: true }));

    expect(output?.status.headline).toBe("Payment action required");
    expect(output?.status.nextAction).toBe("Complete required payment action");
  });
});

describe("PaymentViewModelProvider", () => {
  it("transforms presentation models into ui-ready payment view models with defaults", () => {
    const provider = new PaymentViewModelProvider();
    const mapper = new PaymentPresentationMapper();
    const mapped = mapper.map(createEngineResult());

    if (!mapped) {
      throw new Error("Expected mapped payment presentation output");
    }

    const viewModel = provider.provideViewModel(
      mapped.summary,
      mapped.lifecycle,
      mapped.status,
      "payment-request-7001",
    );

    expect(viewModel.summary.totalAmount).toBe(45400);
    expect(viewModel.cta.label).toBe("View Payment");
    expect(viewModel.badgeStyles.statusBadge).toBe("success");
    expect(viewModel.badgeStyles.paymentMethodBadge).toBe("info");
    expect(viewModel.displayLabels.totalLabel).toBe("ZAR 45400.00");
    expect(viewModel.metadata.requestId).toBe("payment-request-7001");
    expect(Object.isFrozen(viewModel)).toBe(true);
    expect(Object.isFrozen(viewModel.cta)).toBe(true);
    expect(Object.isFrozen(viewModel.badgeStyles)).toBe(true);
    expect(Object.isFrozen(viewModel.displayLabels)).toBe(true);
  });

  it("maps payment engine results directly to payment view models", () => {
    const provider = new PaymentViewModelProvider();
    const viewModel = provider.mapPaymentResultToViewModel(createEngineResult());

    expect(viewModel?.summary.paymentReference).toBe("payment-7001");
    expect(viewModel?.status.headline).toBe("Payment ready");
  });

  it("returns null when mapper has no successful presentation output", () => {
    const provider = new PaymentViewModelProvider();
    const viewModel = provider.mapPaymentResultToViewModel(
      createEngineResult({ success: false, payment: null }),
    );

    expect(viewModel).toBeNull();
  });

  it("applies cta defaults for required actions", () => {
    const provider = new PaymentViewModelProvider();
    const mapper = new PaymentPresentationMapper();
    const mapped = mapper.map(createEngineResult({ pending: true }));

    if (!mapped) {
      throw new Error("Expected mapped payment presentation output");
    }

    const viewModel = provider.provideViewModel(
      mapped.summary,
      mapped.lifecycle,
      mapped.status,
      "payment-request-7001",
    );

    expect(viewModel.cta.label).toBe("Complete Action");
    expect(viewModel.cta.style).toBe("secondary");
  });
});

describe("Payment presentation contracts", () => {
  it("exposes compile-safe presentation model factories", () => {
    const summary: PaymentSummaryPresentationModel = createPaymentSummaryPresentationModel({
      paymentReference: "payment-7001",
      reservationReference: "RES-7001",
      traveller: "Traveller",
      totalAmount: 45400,
      currency: "ZAR",
      paymentMethod: "CARD",
      paymentStatus: "COMPLETED",
    });

    const lifecycle: PaymentLifecyclePresentationModel = createPaymentLifecyclePresentationModel({
      authorizationStatus: "APPROVED",
      captureStatus: "CAPTURED",
      settlementStatus: "SETTLED",
      refundStatus: "REFUNDED",
      lifecycleTimeline: [],
    });

    const status: PaymentStatusPresentationModel = createPaymentStatusPresentationModel({
      headline: "Payment ready",
      statusBadge: "success",
      nextAction: "No action required",
      warnings: [],
      informationalMessages: [],
    });

    const viewModel = createPaymentViewModel({
      summary,
      lifecycle,
      status,
      cta: {
        label: "View Payment",
        href: "#payment-summary",
        style: "neutral",
      },
      badgeStyles: {
        statusBadge: "success",
        paymentMethodBadge: "info",
      },
      displayLabels: {
        totalLabel: "ZAR 45400.00",
        statusLabel: "COMPLETED",
        lifecycleLabel: "APPROVED / CAPTURED / SETTLED",
      },
      metadata: {
        generatedAt: new Date("2026-08-07T15:20:00.000Z"),
        version: "1.0.0",
        requestId: "payment-request-7001",
      },
    });

    expect(typeof viewModel.displayLabels.totalLabel).toBe("string");
  });
});
