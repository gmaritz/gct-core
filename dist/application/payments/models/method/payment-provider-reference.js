"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentProviderReference = createPaymentProviderReference;
function createPaymentProviderReference(reference) {
    return Object.freeze({
        providerIdentifier: reference.providerIdentifier,
        reference: reference.reference,
        correlationId: reference.correlationId,
    });
}
//# sourceMappingURL=payment-provider-reference.js.map