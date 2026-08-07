"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderIntegrationService = void 0;
const models_1 = require("../models");
const models_2 = require("./models");
function collectWarnings(engineResult) {
    return Object.freeze([
        ...(engineResult.validationResult.warnings ?? []),
        ...(engineResult.policyEvaluation?.warnings ?? []),
        ...(engineResult.processingResult?.warnings ?? []),
    ]);
}
function deriveRequestId(engineResult) {
    return engineResult.metadata.requestId;
}
function deriveSource(engineResult) {
    return engineResult.metadata.source;
}
function createBusinessFailureResult(engineResult, providerReference, operation) {
    return (0, models_2.createPaymentGatewayResult)({
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
function buildGatewayContext(payment, providerReference, operation, amount, engineResult) {
    const gatewayRequest = (0, models_2.createPaymentGatewayRequest)({
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
    return (0, models_2.createPaymentProviderContext)({
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
class PaymentProviderIntegrationService {
    constructor(gateway) {
        this.gateway = gateway;
    }
    async authorize(request) {
        return this.execute(models_2.PaymentProviderOperation.AUTHORIZE, request, request.amount ?? request.engineResult.payment?.paymentAmount);
    }
    async capture(request) {
        return this.execute(models_2.PaymentProviderOperation.CAPTURE, request, request.amount ?? request.engineResult.payment?.paymentAmount);
    }
    async settle(request) {
        return this.execute(models_2.PaymentProviderOperation.SETTLE, request, request.amount ?? request.engineResult.payment?.paymentAmount);
    }
    async refund(request) {
        return this.execute(models_2.PaymentProviderOperation.REFUND, request, request.amount ?? request.engineResult.payment?.paymentAmount);
    }
    async status(request) {
        return this.execute(models_2.PaymentProviderOperation.STATUS, request, request.amount ?? request.engineResult.payment?.paymentAmount);
    }
    async execute(operation, request, amount) {
        const { engineResult, providerReference } = request;
        if (!engineResult.success || !engineResult.payment) {
            return createBusinessFailureResult(engineResult, providerReference, operation);
        }
        const payment = engineResult.payment;
        const effectiveAmount = typeof amount === "number" ? amount : payment.paymentAmount;
        const context = buildGatewayContext(payment, providerReference, operation, effectiveAmount, engineResult);
        const gatewayResult = await this.gateway.execute(context);
        return (0, models_2.createPaymentGatewayResult)({
            success: gatewayResult.success,
            providerReference: gatewayResult.providerReference ?? providerReference,
            transactionReference: gatewayResult.transactionReference,
            authorizationStatus: gatewayResult.authorizationStatus,
            captureStatus: gatewayResult.captureStatus,
            settlementStatus: gatewayResult.settlementStatus,
            paymentStatus: gatewayResult.paymentStatus ?? payment.status ?? models_1.PaymentStatus.CREATED,
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
exports.PaymentProviderIntegrationService = PaymentProviderIntegrationService;
//# sourceMappingURL=payment-provider-integration-service.js.map