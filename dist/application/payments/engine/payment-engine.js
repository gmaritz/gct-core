"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEngine = exports.DefaultPaymentAggregateFactory = void 0;
const aggregate_1 = require("../aggregate");
const policies_1 = require("../policies");
const processing_1 = require("../processing");
const models_1 = require("../models");
const models_2 = require("./models");
function ensurePresent(value, message) {
    if (value === null || typeof value === "undefined") {
        throw new Error(message);
    }
    return value;
}
function resolveMetadata(metadata) {
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
function toPolicyContext(executionContext) {
    const paymentRequest = executionContext.paymentRequest;
    return (0, policies_1.createPaymentPolicyContext)({
        reservationSnapshot: ensurePresent(paymentRequest.reservationSnapshot, "Reservation snapshot is required."),
        pricingSnapshot: ensurePresent(paymentRequest.pricingSnapshot, "Pricing snapshot is required."),
        paymentRequest,
        paymentMethod: ensurePresent(paymentRequest.paymentMethod, "Payment method is required."),
        paymentMetadata: resolveMetadata(paymentRequest.metadata),
    });
}
function toProcessingContext(executionContext) {
    const paymentRequest = executionContext.paymentRequest;
    const reservationSnapshot = ensurePresent(paymentRequest.reservationSnapshot, "Reservation snapshot is required.");
    const pricingSnapshot = ensurePresent(paymentRequest.pricingSnapshot, "Pricing snapshot is required.");
    const paymentMethod = ensurePresent(paymentRequest.paymentMethod, "Payment method is required.");
    const metadata = resolveMetadata(paymentRequest.metadata);
    return (0, processing_1.createPaymentProcessingContext)({
        paymentSnapshot: (0, models_1.createPaymentState)({
            reference: ensurePresent(paymentRequest.reference, "Payment reference is required."),
            reservationSnapshot,
            pricingSnapshot,
            paymentAmount: ensurePresent(paymentRequest.paymentAmount, "Payment amount is required."),
            currency: ensurePresent(paymentRequest.currency, "Payment currency is required."),
            paymentMethod,
            status: paymentRequest.status ?? models_1.PaymentStatus.CREATED,
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
function hasPendingProcessing(result) {
    if (!result) {
        return false;
    }
    return result.stageResults.some((stageResult) => stageResult.status === processing_1.PaymentProcessingStatus.PENDING);
}
class DefaultPaymentAggregateFactory {
    create(context) {
        const processingResult = ensurePresent(context.processingResult, "Processing result is required for aggregate creation.");
        const snapshot = processingResult.finalContext.paymentSnapshot;
        const composition = {
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
        return aggregate_1.Payment.create(composition);
    }
}
exports.DefaultPaymentAggregateFactory = DefaultPaymentAggregateFactory;
class PaymentEngine {
    constructor(validationPipeline, policyPipeline, processingPipeline, aggregateFactory) {
        this.validationPipeline = validationPipeline;
        this.policyPipeline = policyPipeline;
        this.processingPipeline = processingPipeline;
        this.aggregateFactory = aggregateFactory;
    }
    async execute(request) {
        const engineContext = (0, models_2.createPaymentEngineContext)(request);
        const executionContext = (0, models_2.createPaymentExecutionContext)(engineContext);
        const validationResult = this.validationPipeline.execute(executionContext.paymentRequest);
        const withValidation = (0, models_2.withExecutionValidationResult)(executionContext, validationResult);
        if (!validationResult.success) {
            return (0, models_2.createPaymentEngineResult)({
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
        const policyEvaluation = this.policyPipeline.evaluate(toPolicyContext(withValidation));
        const withPolicy = (0, models_2.withExecutionPolicyEvaluation)(withValidation, policyEvaluation);
        if (!policyEvaluation.permitted) {
            return (0, models_2.createPaymentEngineResult)({
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
        if (policyEvaluation.outcome === policies_1.PaymentPolicyOutcome.REQUIRE_ACTION) {
            return (0, models_2.createPaymentEngineResult)({
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
        const withProcessing = (0, models_2.withExecutionProcessingResult)(withPolicy, processingResult);
        if (!processingResult.success) {
            return (0, models_2.createPaymentEngineResult)({
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
        const completedContext = (0, models_2.withExecutionPaymentAggregate)(withProcessing, paymentAggregate);
        return (0, models_2.createPaymentEngineResult)({
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
exports.PaymentEngine = PaymentEngine;
//# sourceMappingURL=payment-engine.js.map