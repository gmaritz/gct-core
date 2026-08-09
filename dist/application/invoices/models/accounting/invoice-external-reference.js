"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceExternalReference = createInvoiceExternalReference;
function createInvoiceExternalReference(reference) {
    return Object.freeze({
        system: reference.system,
        reference: reference.reference,
    });
}
//# sourceMappingURL=invoice-external-reference.js.map