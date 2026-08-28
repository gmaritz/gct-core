"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentGatewayResult = createPaymentGatewayResult;
function createPaymentGatewayResult(result) {
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
//# sourceMappingURL=payment-gateway-result.js.map