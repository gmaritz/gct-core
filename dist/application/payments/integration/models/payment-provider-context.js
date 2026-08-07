"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentProviderContext = createPaymentProviderContext;
function createPaymentProviderContext(context) {
    return Object.freeze({
        paymentAggregate: context.paymentAggregate,
        gatewayRequest: context.gatewayRequest,
        operation: context.operation,
        metadata: Object.freeze({
            startedAt: new Date(context.metadata.startedAt.getTime()),
            version: context.metadata.version,
            requestId: context.metadata.requestId,
            source: context.metadata.source,
        }),
    });
}
//# sourceMappingURL=payment-provider-context.js.map