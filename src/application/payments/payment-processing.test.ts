import {
  createPaymentProcessingContext,
  createPaymentStageProcessingResult,
  PaymentProcessingContext,
  PaymentProcessingPipeline,
  PaymentProcessingStage,
  PaymentProcessingStatus,
  PaymentProcessorPriority,
  PaymentProcessorRegistry,
  PaymentStageProcessingResult,
} from "@application/payments/processing";
import {
  AuthorizationProcessor,
  CaptureProcessor,
  CompletionProcessor,
  RefundProcessor,
  SettlementProcessor,
} from "@application/payments/processing/contracts";
import {
  createPaymentState,
  PaymentMethod,
  PaymentStatus,
} from "@application/payments/models";
import { PaymentProcessor } from "@application/payments/processing/contracts";

function createContext(): PaymentProcessingContext {
  return createPaymentProcessingContext({
    paymentSnapshot: createPaymentState({
      reference: {
        paymentId: "payment-5001",
        reservationId: "reservation-5001",
      },
      reservationSnapshot: {
        snapshotId: "reservation-snap-5001",
        capturedAt: new Date("2026-08-07T13:00:00.000Z"),
        version: "1.0.0",
        reservationId: "reservation-5001",
        reservationReference: "RES-5001",
      },
      pricingSnapshot: {
        snapshotId: "pricing-snap-5001",
        capturedAt: new Date("2026-08-07T13:01:00.000Z"),
        version: "1.0.0",
        pricingId: "pricing-5001",
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
      status: PaymentStatus.CREATED,
      refunds: [],
    }),
    reservationSnapshot: {
      snapshotId: "reservation-snap-5001",
      capturedAt: new Date("2026-08-07T13:00:00.000Z"),
      version: "1.0.0",
      reservationId: "reservation-5001",
      reservationReference: "RES-5001",
    },
    pricingSnapshot: {
      snapshotId: "pricing-snap-5001",
      capturedAt: new Date("2026-08-07T13:01:00.000Z"),
      version: "1.0.0",
      pricingId: "pricing-5001",
      subtotal: 25000,
      taxes: 3000,
      discounts: 1000,
      fees: 200,
      total: 27200,
      currency: "ZAR",
    },
    paymentMethod: PaymentMethod.CARD,
    processingMetadata: {
      createdAt: new Date("2026-08-07T13:00:00.000Z"),
      updatedAt: new Date("2026-08-07T13:00:00.000Z"),
      version: "1.0.0",
      source: "test",
      correlationId: "corr-5001",
    },
  });
}

function createStageResult(
  processorName: string,
  stage: PaymentProcessingStage,
  status: PaymentProcessingStatus,
  context: PaymentProcessingContext,
): PaymentStageProcessingResult {
  return createPaymentStageProcessingResult({
    processorName,
    stage,
    status,
    context,
    warnings: status === PaymentProcessingStatus.SKIPPED ? ["stage skipped"] : [],
    metadata: {
      processedAt: new Date("2026-08-07T13:10:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function contextWithSource(context: PaymentProcessingContext, source: string): PaymentProcessingContext {
  return createPaymentProcessingContext({
    ...context,
    processingMetadata: {
      ...context.processingMetadata,
      source,
      updatedAt: new Date("2026-08-07T13:15:00.000Z"),
    },
  });
}

describe("PaymentProcessorRegistry", () => {
  it("registers and resolves processors", () => {
    const registry = new PaymentProcessorRegistry();
    const processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> = {
      process: (context) =>
        createStageResult(
          "authorization",
          PaymentProcessingStage.AUTHORIZATION,
          PaymentProcessingStatus.COMPLETED,
          context,
        ),
    };

    registry.register(
      "authorization",
      PaymentProcessingStage.AUTHORIZATION,
      processor,
      PaymentProcessorPriority.HIGH,
    );

    const resolved = registry.resolve("authorization");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("authorization");
    expect(resolved?.stage).toBe(PaymentProcessingStage.AUTHORIZATION);
    expect(resolved?.priority).toBe(PaymentProcessorPriority.HIGH);
    expect(resolved?.processor).toBe(processor);
  });

  it("rejects duplicate processor registration", () => {
    const registry = new PaymentProcessorRegistry();
    const processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> = {
      process: (context) =>
        createStageResult("capture", PaymentProcessingStage.CAPTURE, PaymentProcessingStatus.COMPLETED, context),
    };

    registry.register("capture", PaymentProcessingStage.CAPTURE, processor, PaymentProcessorPriority.NORMAL);

    expect(() =>
      registry.register("capture", PaymentProcessingStage.CAPTURE, processor, PaymentProcessorPriority.CRITICAL)
    ).toThrow("Payment processor 'capture' is already registered.");
  });

  it("unregisters processors", () => {
    const registry = new PaymentProcessorRegistry();
    const processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> = {
      process: (context) =>
        createStageResult("settlement", PaymentProcessingStage.SETTLEMENT, PaymentProcessingStatus.COMPLETED, context),
    };

    registry.register("settlement", PaymentProcessingStage.SETTLEMENT, processor, PaymentProcessorPriority.LOW);

    expect(registry.unregister("settlement")).toBe(true);
    expect(registry.resolve("settlement")).toBeUndefined();
    expect(registry.unregister("settlement")).toBe(false);
  });

  it("resolves all processors in deterministic order and immutable collection", () => {
    const registry = new PaymentProcessorRegistry();

    registry.register(
      "normal",
      PaymentProcessingStage.COMPLETION,
      { process: (context) => createStageResult("normal", PaymentProcessingStage.COMPLETION, PaymentProcessingStatus.COMPLETED, context) },
      PaymentProcessorPriority.NORMAL,
    );
    registry.register(
      "critical",
      PaymentProcessingStage.AUTHORIZATION,
      { process: (context) => createStageResult("critical", PaymentProcessingStage.AUTHORIZATION, PaymentProcessingStatus.COMPLETED, context) },
      PaymentProcessorPriority.CRITICAL,
    );
    registry.register(
      "high",
      PaymentProcessingStage.CAPTURE,
      { process: (context) => createStageResult("high", PaymentProcessingStage.CAPTURE, PaymentProcessingStatus.COMPLETED, context) },
      PaymentProcessorPriority.HIGH,
    );
    registry.register(
      "low",
      PaymentProcessingStage.REFUND,
      { process: (context) => createStageResult("low", PaymentProcessingStage.REFUND, PaymentProcessingStatus.COMPLETED, context) },
      PaymentProcessorPriority.LOW,
    );

    const registrations = registry.resolveAll();

    expect(registrations.map((registration) => registration.name)).toEqual(["critical", "high", "normal", "low"]);
    expect(Object.isFrozen(registrations)).toBe(true);
    expect(Object.isFrozen(registrations[0])).toBe(true);
  });
});

describe("PaymentProcessingPipeline", () => {
  it("executes processors in priority order with constructor injection", () => {
    const registry = new PaymentProcessorRegistry();
    const events: string[] = [];

    registry.register(
      "normal",
      PaymentProcessingStage.COMPLETION,
      {
        process: (context) => {
          events.push("normal");
          return createStageResult("normal", PaymentProcessingStage.COMPLETION, PaymentProcessingStatus.COMPLETED, context);
        },
      },
      PaymentProcessorPriority.NORMAL,
    );
    registry.register(
      "critical",
      PaymentProcessingStage.AUTHORIZATION,
      {
        process: (context) => {
          events.push("critical");
          return createStageResult("critical", PaymentProcessingStage.AUTHORIZATION, PaymentProcessingStatus.COMPLETED, context);
        },
      },
      PaymentProcessorPriority.CRITICAL,
    );

    const pipeline = new PaymentProcessingPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(events).toEqual(["critical", "normal"]);
    expect(result.success).toBe(true);
  });

  it("enriches context across stages and preserves immutability", () => {
    const registry = new PaymentProcessorRegistry();

    registry.register(
      "authorization",
      PaymentProcessingStage.AUTHORIZATION,
      {
        process: (context) =>
          createStageResult(
            "authorization",
            PaymentProcessingStage.AUTHORIZATION,
            PaymentProcessingStatus.COMPLETED,
            contextWithSource(context, "authorization-processor"),
          ),
      },
      PaymentProcessorPriority.CRITICAL,
    );

    registry.register(
      "completion",
      PaymentProcessingStage.COMPLETION,
      {
        process: (context) =>
          createStageResult(
            "completion",
            PaymentProcessingStage.COMPLETION,
            PaymentProcessingStatus.COMPLETED,
            contextWithSource(context, "completion-processor"),
          ),
      },
      PaymentProcessorPriority.HIGH,
    );

    const pipeline = new PaymentProcessingPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(result.finalContext.processingMetadata.source).toBe("completion-processor");
    expect(result.stageResults[0].context.processingMetadata.source).toBe("authorization-processor");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.stageResults)).toBe(true);
    expect(Object.isFrozen(result.finalContext)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("short-circuits on FAILED", () => {
    const registry = new PaymentProcessorRegistry();
    const events: string[] = [];

    registry.register(
      "capture-failed",
      PaymentProcessingStage.CAPTURE,
      {
        process: (context) => {
          events.push("capture-failed");
          return createStageResult("capture-failed", PaymentProcessingStage.CAPTURE, PaymentProcessingStatus.FAILED, context);
        },
      },
      PaymentProcessorPriority.CRITICAL,
    );

    registry.register(
      "settlement",
      PaymentProcessingStage.SETTLEMENT,
      {
        process: (context) => {
          events.push("settlement");
          return createStageResult("settlement", PaymentProcessingStage.SETTLEMENT, PaymentProcessingStatus.COMPLETED, context);
        },
      },
      PaymentProcessorPriority.HIGH,
    );

    const pipeline = new PaymentProcessingPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(events).toEqual(["capture-failed"]);
    expect(result.success).toBe(false);
    expect(result.stageResults.at(-1)?.status).toBe(PaymentProcessingStatus.FAILED);
  });

  it("propagates PENDING and SKIPPED stage outcomes", () => {
    const registry = new PaymentProcessorRegistry();

    registry.register(
      "authorization-pending",
      PaymentProcessingStage.AUTHORIZATION,
      {
        process: (context) =>
          createStageResult(
            "authorization-pending",
            PaymentProcessingStage.AUTHORIZATION,
            PaymentProcessingStatus.PENDING,
            context,
          ),
      },
      PaymentProcessorPriority.CRITICAL,
    );

    registry.register(
      "refund-skipped",
      PaymentProcessingStage.REFUND,
      {
        process: (context) =>
          createStageResult("refund-skipped", PaymentProcessingStage.REFUND, PaymentProcessingStatus.SKIPPED, context),
      },
      PaymentProcessorPriority.HIGH,
    );

    const pipeline = new PaymentProcessingPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(result.success).toBe(true);
    expect(result.stageResults.map((stage) => stage.status)).toEqual([
      PaymentProcessingStatus.PENDING,
      PaymentProcessingStatus.SKIPPED,
    ]);
    expect(result.warnings).toEqual(["stage skipped"]);
  });
});

describe("Payment processing contracts", () => {
  it("exposes compile-safe processor family interfaces", () => {
    const authorization: AuthorizationProcessor = {
      process: (context) =>
        createStageResult("authorization", PaymentProcessingStage.AUTHORIZATION, PaymentProcessingStatus.COMPLETED, context),
    };
    const capture: CaptureProcessor = {
      process: (context) =>
        createStageResult("capture", PaymentProcessingStage.CAPTURE, PaymentProcessingStatus.COMPLETED, context),
    };
    const settlement: SettlementProcessor = {
      process: (context) =>
        createStageResult("settlement", PaymentProcessingStage.SETTLEMENT, PaymentProcessingStatus.COMPLETED, context),
    };
    const completion: CompletionProcessor = {
      process: (context) =>
        createStageResult("completion", PaymentProcessingStage.COMPLETION, PaymentProcessingStatus.COMPLETED, context),
    };
    const refund: RefundProcessor = {
      process: (context) =>
        createStageResult("refund", PaymentProcessingStage.REFUND, PaymentProcessingStatus.SKIPPED, context),
    };

    expect(typeof authorization.process).toBe("function");
    expect(typeof capture.process).toBe("function");
    expect(typeof settlement.process).toBe("function");
    expect(typeof completion.process).toBe("function");
    expect(typeof refund.process).toBe("function");
  });
});
