import {
  createPaymentEngineContext,
  createPaymentEngineResult,
  createPaymentExecutionContext,
  DefaultPaymentAggregateFactory,
  PaymentEngine,
  PaymentEngineRequest,
  PaymentExecutionContext,
  withExecutionPaymentAggregate,
  withExecutionPolicyEvaluation,
  withExecutionProcessingResult,
  withExecutionValidationResult,
} from "@application/payments/engine";
import {
  PaymentPolicyEvaluation,
  PaymentPolicyOutcome,
  PaymentPolicyPipeline,
  PaymentPolicyPriority,
  PaymentRequiredAction,
  createPaymentPolicyResult,
} from "@application/payments/policies";
import {
  PaymentProcessingPipeline,
  PaymentProcessingResult,
  PaymentProcessingStage,
  PaymentProcessingStatus,
  createPaymentProcessingContext,
  createPaymentProcessingResult,
  createPaymentStageProcessingResult,
} from "@application/payments/processing";
import { PaymentValidationPipeline } from "@application/payments/validation";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  createPaymentState,
  createPaymentValidationResult,
  PaymentValidationStage,
  PaymentValidationErrorCode,
  createPaymentValidationError,
} from "@application/payments";

function createRequest(): PaymentEngineRequest {
  return {
    requestId: "payment-engine-request-001",
    source: "test",
    paymentRequest: {
      reference: {
        paymentId: "payment-6001",
        reservationId: "reservation-6001",
      },
      reservationSnapshot: {
        snapshotId: "reservation-snap-6001",
        capturedAt: new Date("2026-08-07T14:00:00.000Z"),
        version: "1.0.0",
        reservationId: "reservation-6001",
        reservationReference: "RES-6001",
      },
      pricingSnapshot: {
        snapshotId: "pricing-snap-6001",
        capturedAt: new Date("2026-08-07T14:01:00.000Z"),
        version: "1.0.0",
        pricingId: "pricing-6001",
        subtotal: 30000,
        taxes: 4000,
        discounts: 1000,
        fees: 300,
        total: 33300,
        currency: "ZAR",
      },
      paymentAmount: 33300,
      currency: "ZAR",
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.CREATED,
      metadata: {
        createdAt: new Date("2026-08-07T14:00:00.000Z"),
        updatedAt: new Date("2026-08-07T14:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
      reservationContext: {
        exists: true,
        status: "CONFIRMED",
        payable: true,
      },
      gatewayContext: {
        correlationId: "corr-6001",
        requestId: "gw-request-6001",
        paymentContextId: "ctx-6001",
      },
    },
  };
}

function createValidation(success: boolean): ReturnType<typeof createPaymentValidationResult> {
  return createPaymentValidationResult({
    stage: PaymentValidationStage.REQUEST,
    errors: success
      ? []
      : [
          createPaymentValidationError({
            stage: PaymentValidationStage.REQUEST,
            code: PaymentValidationErrorCode.MISSING_PAYMENT_IDENTIFIER,
            message: "validation failed",
            severity: "CRITICAL",
          }),
        ],
    warnings: success ? [] : ["validation warning"],
    metadata: {
      validatedAt: new Date("2026-08-07T14:10:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPolicy(outcome: PaymentPolicyOutcome): PaymentPolicyEvaluation {
  const permitted = outcome !== PaymentPolicyOutcome.DENY;

  return Object.freeze({
    permitted,
    outcome,
    priority: permitted ? PaymentPolicyPriority.NORMAL : PaymentPolicyPriority.CRITICAL,
    requiredActions: Object.freeze(
      outcome === PaymentPolicyOutcome.REQUIRE_ACTION ? [PaymentRequiredAction.MANUAL_APPROVAL] : [],
    ),
    policyResults: Object.freeze([
      createPaymentPolicyResult({
        policyName: "payment-policy",
        outcome,
        priority: permitted ? PaymentPolicyPriority.NORMAL : PaymentPolicyPriority.CRITICAL,
        warnings: permitted ? [] : ["policy warning"],
        metadata: {
          evaluatedAt: new Date("2026-08-07T14:11:00.000Z"),
          version: "1.0.0",
          source: "test",
        },
      }),
    ]),
    warnings: Object.freeze(permitted ? [] : ["policy warning"]),
    metadata: Object.freeze({
      evaluatedAt: new Date("2026-08-07T14:11:00.000Z"),
      version: "1.0.0",
      source: "test",
    }),
  });
}

function createProcessingResult(statuses: ReadonlyArray<PaymentProcessingStatus>): PaymentProcessingResult {
  const request = createRequest();

  const stageResults = statuses.map((status, index) =>
    createPaymentStageProcessingResult({
      processorName: `processor-${index + 1}`,
      stage:
        index === 0
          ? PaymentProcessingStage.AUTHORIZATION
          : index === 1
            ? PaymentProcessingStage.CAPTURE
            : PaymentProcessingStage.SETTLEMENT,
      status,
      context: createPaymentProcessingContext({
        paymentSnapshot: createPaymentState({
          reference: request.paymentRequest.reference!,
          reservationSnapshot: request.paymentRequest.reservationSnapshot!,
          pricingSnapshot: request.paymentRequest.pricingSnapshot!,
          paymentAmount: request.paymentRequest.paymentAmount!,
          currency: request.paymentRequest.currency!,
          paymentMethod: request.paymentRequest.paymentMethod!,
          status: status === PaymentProcessingStatus.COMPLETED ? PaymentStatus.COMPLETED : PaymentStatus.CREATED,
          refunds: [],
        }),
        reservationSnapshot: request.paymentRequest.reservationSnapshot!,
        pricingSnapshot: request.paymentRequest.pricingSnapshot!,
        paymentMethod: request.paymentRequest.paymentMethod!,
        processingMetadata: {
          ...request.paymentRequest.metadata!,
          source: `processor-${index + 1}`,
          correlationId: request.paymentRequest.gatewayContext?.correlationId,
        },
      }),
      warnings: status === PaymentProcessingStatus.SKIPPED ? ["stage skipped"] : [],
      metadata: {
        processedAt: new Date("2026-08-07T14:12:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    }),
  );

  return createPaymentProcessingResult({
    success: !statuses.includes(PaymentProcessingStatus.FAILED),
    stageResults,
    finalContext: stageResults[stageResults.length - 1].context,
    warnings: stageResults.flatMap((result) => result.warnings),
    metadata: {
      processedAt: new Date("2026-08-07T14:12:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPaymentAggregate(): Payment {
  const request = createRequest();

  return Payment.create({
    reference: request.paymentRequest.reference!,
    reservationSnapshot: request.paymentRequest.reservationSnapshot!,
    pricingSnapshot: request.paymentRequest.pricingSnapshot!,
    paymentAmount: request.paymentRequest.paymentAmount!,
    currency: request.paymentRequest.currency!,
    paymentMethod: request.paymentRequest.paymentMethod!,
    status: PaymentStatus.COMPLETED,
    refunds: [],
    timeline: [],
    metadata: request.paymentRequest.metadata!,
  });
}

describe("PaymentEngine", () => {
  it("supports constructor injection and compile safety", async () : Promise<void> => {
    const engine = new PaymentEngine(
      {
        execute: () => createValidation(true),
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: () => createPolicy(PaymentPolicyOutcome.ALLOW),
      } as unknown as PaymentPolicyPipeline,
      {
        execute: () => createProcessingResult([PaymentProcessingStatus.COMPLETED]),
      } as unknown as PaymentProcessingPipeline,
      {
        create: () => createPaymentAggregate(),
      },
    );

    const result = await engine.execute(createRequest());

    expect(result.success).toBe(true);
  });

  it("orchestrates validation, policy, processing and aggregate creation in order", async () => {
    const events: string[] = [];

    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => {
          events.push("policy");
          return createPolicy(PaymentPolicyOutcome.ALLOW);
        },
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => {
          events.push("processing");
          return createProcessingResult([PaymentProcessingStatus.COMPLETED]);
        },
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => {
          events.push("aggregate");
          return createPaymentAggregate();
        },
      },
    );

    const result = await engine.execute(createRequest());

    expect(events).toEqual(["validation", "policy", "processing", "aggregate"]);
    expect(result.success).toBe(true);
    expect(result.payment?.reference.paymentId).toBe("payment-6001");
  });

  it("fails fast on validation failure", async () => {
    const events: string[] = [];

    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => {
          events.push("validation");
          return createValidation(false);
        },
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => {
          events.push("policy");
          return createPolicy(PaymentPolicyOutcome.ALLOW);
        },
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => {
          events.push("processing");
          return createProcessingResult([PaymentProcessingStatus.COMPLETED]);
        },
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => {
          events.push("aggregate");
          return createPaymentAggregate();
        },
      },
    );

    const result = await engine.execute(createRequest());

    expect(events).toEqual(["validation"]);
    expect(result.success).toBe(false);
    expect(result.policyEvaluation).toBeUndefined();
    expect(result.processingResult).toBeUndefined();
    expect(result.payment).toBeNull();
  });

  it("fails fast on policy deny", async () => {
    const events: string[] = [];

    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => {
          events.push("policy");
          return createPolicy(PaymentPolicyOutcome.DENY);
        },
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => {
          events.push("processing");
          return createProcessingResult([PaymentProcessingStatus.COMPLETED]);
        },
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => {
          events.push("aggregate");
          return createPaymentAggregate();
        },
      },
    );

    const result = await engine.execute(createRequest());

    expect(events).toEqual(["validation", "policy"]);
    expect(result.success).toBe(false);
    expect(result.processingResult).toBeUndefined();
    expect(result.payment).toBeNull();
  });

  it("returns successful pending result when policy requires action", async () => {
    const events: string[] = [];

    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => {
          events.push("policy");
          return createPolicy(PaymentPolicyOutcome.REQUIRE_ACTION);
        },
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => {
          events.push("processing");
          return createProcessingResult([PaymentProcessingStatus.COMPLETED]);
        },
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => {
          events.push("aggregate");
          return createPaymentAggregate();
        },
      },
    );

    const result = await engine.execute(createRequest());

    expect(events).toEqual(["validation", "policy"]);
    expect(result.success).toBe(true);
    expect(result.processingResult).toBeUndefined();
    expect(result.payment).toBeNull();
    expect(result.metadata.pending).toBe(true);
  });

  it("fails on processing FAILED and skips aggregate", async () => {
    const events: string[] = [];

    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => {
          events.push("policy");
          return createPolicy(PaymentPolicyOutcome.ALLOW);
        },
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => {
          events.push("processing");
          return createProcessingResult([PaymentProcessingStatus.FAILED]);
        },
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => {
          events.push("aggregate");
          return createPaymentAggregate();
        },
      },
    );

    const result = await engine.execute(createRequest());

    expect(events).toEqual(["validation", "policy", "processing"]);
    expect(result.success).toBe(false);
    expect(result.payment).toBeNull();
  });

  it("propagates processing PENDING and SKIPPED outcomes", async () => {
    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => createValidation(true),
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => createPolicy(PaymentPolicyOutcome.ALLOW),
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => createProcessingResult([PaymentProcessingStatus.PENDING, PaymentProcessingStatus.SKIPPED]),
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => createPaymentAggregate(),
      },
    );

    const result = await engine.execute(createRequest());

    expect(result.success).toBe(true);
    expect(result.processingResult?.stageResults.map((stage) => stage.status)).toEqual([
      PaymentProcessingStatus.PENDING,
      PaymentProcessingStatus.SKIPPED,
    ]);
    expect(result.metadata.pending).toBe(true);
  });

  it("returns immutable engine results", async () => {
    const engine = new PaymentEngine(
      {
        execute: (): ReturnType<typeof createPaymentValidationResult> => createValidation(true),
      } as unknown as PaymentValidationPipeline,
      {
        evaluate: (): PaymentPolicyEvaluation => createPolicy(PaymentPolicyOutcome.ALLOW),
      } as unknown as PaymentPolicyPipeline,
      {
        execute: (): PaymentProcessingResult => createProcessingResult([PaymentProcessingStatus.COMPLETED]),
      } as unknown as PaymentProcessingPipeline,
      {
        create: (): Payment => createPaymentAggregate(),
      },
    );

    const result = await engine.execute(createRequest());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.metadata.stages)).toBe(true);
    expect(result.payment).not.toBeNull();
  });
});

describe("PaymentExecutionContext", () => {
  it("creates immutable context and supports stage enrichment", () => {
    const request = createRequest();
    const engineContext = createPaymentEngineContext(request);
    const executionContext = createPaymentExecutionContext(engineContext);
    const withValidation = withExecutionValidationResult(executionContext, createValidation(true));
    const withPolicy = withExecutionPolicyEvaluation(withValidation, createPolicy(PaymentPolicyOutcome.ALLOW));
    const withProcessing = withExecutionProcessingResult(
      withPolicy,
      createProcessingResult([PaymentProcessingStatus.COMPLETED]),
    );
    const withAggregate = withExecutionPaymentAggregate(withProcessing, createPaymentAggregate());

    expect(Object.isFrozen(engineContext)).toBe(true);
    expect(Object.isFrozen(engineContext.metadata)).toBe(true);
    expect(Object.isFrozen(executionContext)).toBe(true);
    expect(withValidation.validationResult?.success).toBe(true);
    expect(withPolicy.policyEvaluation?.permitted).toBe(true);
    expect(withProcessing.processingResult?.success).toBe(true);
    expect(withAggregate.paymentAggregate?.reference.paymentId).toBe("payment-6001");
    expect(withAggregate.metadata.stages).toEqual([
      "CONTEXT",
      "VALIDATION",
      "POLICY",
      "PROCESSING",
      "AGGREGATE",
    ]);
  });
});

describe("PaymentEngineResult", () => {
  it("creates immutable result and preserves metadata", () => {
    const validation = createValidation(true);

    const result = createPaymentEngineResult({
      success: true,
      payment: createPaymentAggregate(),
      validationResult: validation,
      metadata: {
        completedAt: new Date("2026-08-07T14:20:00.000Z"),
        version: "1.0.0",
        requestId: "payment-engine-request-001",
        source: "test",
        stages: ["CONTEXT", "VALIDATION"],
        pending: false,
      },
    });

    expect(result.validationResult).toBe(validation);
    expect(result.metadata.requestId).toBe("payment-engine-request-001");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.metadata.stages)).toBe(true);
  });
});

describe("DefaultPaymentAggregateFactory", () => {
  it("constructs payment aggregate from execution processing context", () => {
    const request = createRequest();
    const engineContext = createPaymentEngineContext(request);
    const executionContext = withExecutionProcessingResult(
      withExecutionPolicyEvaluation(
        withExecutionValidationResult(createPaymentExecutionContext(engineContext), createValidation(true)),
        createPolicy(PaymentPolicyOutcome.ALLOW),
      ),
      createProcessingResult([PaymentProcessingStatus.COMPLETED]),
    );

    const aggregate = new DefaultPaymentAggregateFactory().create(executionContext as PaymentExecutionContext);

    expect(aggregate.reference.paymentId).toBe("payment-6001");
    expect(aggregate.status).toBe(PaymentStatus.COMPLETED);
    expect(Object.isFrozen(aggregate)).toBe(true);
  });
});
