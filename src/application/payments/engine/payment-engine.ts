import { ApplicationService } from "@application/application-service";
import { Payment, PaymentComposition } from "../aggregate";
import {
  PaymentPolicyContext,
  PaymentPolicyEvaluation,
  PaymentPolicyOutcome,
  PaymentPolicyPipeline,
  createPaymentPolicyContext,
} from "../policies";
import {
  PaymentProcessingContext,
  PaymentProcessingPipeline,
  PaymentProcessingResult,
  PaymentProcessingStatus,
  createPaymentProcessingContext,
} from "../processing";
import {
  createPaymentState,
  PaymentMetadata,
  PaymentStatus,
} from "../models";
import { PaymentValidationPipeline } from "../validation";
import {
  createPaymentEngineContext,
  createPaymentEngineResult,
  createPaymentExecutionContext,
  PaymentEngineRequest,
  PaymentEngineResult,
  PaymentExecutionContext,
  withExecutionPaymentAggregate,
  withExecutionPolicyEvaluation,
  withExecutionProcessingResult,
  withExecutionValidationResult,
} from "./models";

function ensurePresent<T>(value: T | null | undefined, message: string): T {
  if (value === null || typeof value === "undefined") {
    throw new Error(message);
  }

  return value;
}

function resolveMetadata(metadata: PaymentMetadata | null | undefined): PaymentMetadata {
  if (metadata) {
    return metadata;
  }

  const now = new Date();

  return {
    createdAt: now,
    updatedAt: now,
    version: "1.0.0",
    source: "PaymentEngine",
  };
}

function toPolicyContext(executionContext: PaymentExecutionContext): PaymentPolicyContext {
  const paymentRequest = executionContext.paymentRequest;

  return createPaymentPolicyContext({
    reservationSnapshot: ensurePresent(paymentRequest.reservationSnapshot, "Reservation snapshot is required."),
    pricingSnapshot: ensurePresent(paymentRequest.pricingSnapshot, "Pricing snapshot is required."),
    paymentRequest,
    paymentMethod: ensurePresent(paymentRequest.paymentMethod, "Payment method is required."),
    paymentMetadata: resolveMetadata(paymentRequest.metadata),
  });
}

function toProcessingContext(executionContext: PaymentExecutionContext): PaymentProcessingContext {
  const paymentRequest = executionContext.paymentRequest;
  const reservationSnapshot = ensurePresent(paymentRequest.reservationSnapshot, "Reservation snapshot is required.");
  const pricingSnapshot = ensurePresent(paymentRequest.pricingSnapshot, "Pricing snapshot is required.");
  const paymentMethod = ensurePresent(paymentRequest.paymentMethod, "Payment method is required.");
  const metadata = resolveMetadata(paymentRequest.metadata);

  return createPaymentProcessingContext({
    paymentSnapshot: createPaymentState({
      reference: ensurePresent(paymentRequest.reference, "Payment reference is required."),
      reservationSnapshot,
      pricingSnapshot,
      paymentAmount: ensurePresent(paymentRequest.paymentAmount, "Payment amount is required."),
      currency: ensurePresent(paymentRequest.currency, "Payment currency is required."),
      paymentMethod,
      status: paymentRequest.status ?? PaymentStatus.CREATED,
      refunds: [],
    }),
    reservationSnapshot,
    pricingSnapshot,
    paymentMethod,
    processingMetadata: {
      ...metadata,
      correlationId: paymentRequest.gatewayContext?.correlationId,
    },
  });
}

function hasPendingProcessing(result: PaymentProcessingResult | undefined): boolean {
  if (!result) {
    return false;
  }

  return result.stageResults.some((stageResult) => stageResult.status === PaymentProcessingStatus.PENDING);
}

export interface PaymentAggregateFactory {
  create(context: PaymentExecutionContext): Payment;
}

export class DefaultPaymentAggregateFactory implements PaymentAggregateFactory {
  public create(context: PaymentExecutionContext): Payment {
    const processingResult = ensurePresent(context.processingResult, "Processing result is required for aggregate creation.");
    const snapshot = processingResult.finalContext.paymentSnapshot;

    const composition: PaymentComposition = {
      reference: snapshot.reference,
      reservationSnapshot: snapshot.reservationSnapshot,
      pricingSnapshot: snapshot.pricingSnapshot,
      quoteSnapshot: snapshot.quoteSnapshot,
      paymentAmount: snapshot.paymentAmount,
      currency: snapshot.currency,
      paymentMethod: snapshot.paymentMethod,
      paymentInstrument: snapshot.paymentInstrument,
      status: snapshot.status,
      authorization: snapshot.authorization,
      capture: snapshot.capture,
      settlement: snapshot.settlement,
      refunds: snapshot.refunds,
      metadata: processingResult.finalContext.processingMetadata,
      timeline: [],
    };

    return Payment.create(composition);
  }
}

export class PaymentEngine implements ApplicationService<PaymentEngineRequest, PaymentEngineResult> {
  public constructor(
    private readonly validationPipeline: PaymentValidationPipeline,
    private readonly policyPipeline: PaymentPolicyPipeline,
    private readonly processingPipeline: PaymentProcessingPipeline,
    private readonly aggregateFactory: PaymentAggregateFactory,
  ) {}

  public async execute(request: PaymentEngineRequest): Promise<PaymentEngineResult> {
    const engineContext = createPaymentEngineContext(request);
    const executionContext = createPaymentExecutionContext(engineContext);

    const validationResult = this.validationPipeline.execute(executionContext.paymentRequest);
    const withValidation = withExecutionValidationResult(executionContext, validationResult);

    if (!validationResult.success) {
      return createPaymentEngineResult({
        success: false,
        payment: null,
        validationResult,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: withValidation.metadata.requestId,
          source: withValidation.metadata.source,
          stages: withValidation.metadata.stages,
          pending: false,
        },
      });
    }

    const policyEvaluation: PaymentPolicyEvaluation = this.policyPipeline.evaluate(toPolicyContext(withValidation));
    const withPolicy = withExecutionPolicyEvaluation(withValidation, policyEvaluation);

    if (!policyEvaluation.permitted) {
      return createPaymentEngineResult({
        success: false,
        payment: null,
        validationResult,
        policyEvaluation,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: withPolicy.metadata.requestId,
          source: withPolicy.metadata.source,
          stages: withPolicy.metadata.stages,
          pending: false,
        },
      });
    }

    if (policyEvaluation.outcome === PaymentPolicyOutcome.REQUIRE_ACTION) {
      return createPaymentEngineResult({
        success: true,
        payment: null,
        validationResult,
        policyEvaluation,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: withPolicy.metadata.requestId,
          source: withPolicy.metadata.source,
          stages: withPolicy.metadata.stages,
          pending: true,
        },
      });
    }

    const processingResult = this.processingPipeline.execute(toProcessingContext(withPolicy));
    const withProcessing = withExecutionProcessingResult(withPolicy, processingResult);

    if (!processingResult.success) {
      return createPaymentEngineResult({
        success: false,
        payment: null,
        validationResult,
        policyEvaluation,
        processingResult,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: withProcessing.metadata.requestId,
          source: withProcessing.metadata.source,
          stages: withProcessing.metadata.stages,
          pending: false,
        },
      });
    }

    const paymentAggregate = this.aggregateFactory.create(withProcessing);
    const completedContext = withExecutionPaymentAggregate(withProcessing, paymentAggregate);

    return createPaymentEngineResult({
      success: true,
      payment: completedContext.paymentAggregate,
      validationResult,
      policyEvaluation,
      processingResult,
      metadata: {
        completedAt: new Date(),
        version: "1.0.0",
        requestId: completedContext.metadata.requestId,
        source: completedContext.metadata.source,
        stages: completedContext.metadata.stages,
        pending: hasPendingProcessing(processingResult),
      },
    });
  }
}
