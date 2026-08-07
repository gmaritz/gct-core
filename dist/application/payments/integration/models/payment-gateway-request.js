"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentGatewayRequest = createPaymentGatewayRequest;
function createPaymentGatewayRequest(request) {
    return Object.freeze({
        paymentReference: Object.freeze({
            paymentId: request.paymentReference.paymentId,
            reservationId: request.paymentReference.reservationId,
            quotationNumber: request.paymentReference.quotationNumber,
        }),
        reservationReference: request.reservationReference,
        providerReference: Object.freeze({
            providerIdentifier: request.providerReference.providerIdentifier,
            reference: request.providerReference.reference,
            correlationId: request.providerReference.correlationId,
        }),
        operation: request.operation,
        paymentMethod: request.paymentMethod,
        currency: request.currency,
        amount: request.amount,
        metadata: Object.freeze({
            requestedAt: new Date(request.metadata.requestedAt.getTime()),
            version: request.metadata.version,
            requestId: request.metadata.requestId,
            source: request.metadata.source,
        }),
    });
}
//# sourceMappingURL=payment-gateway-request.js.map