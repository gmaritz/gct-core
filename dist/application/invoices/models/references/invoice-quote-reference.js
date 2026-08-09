"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceQuoteReference = createInvoiceQuoteReference;
function createInvoiceQuoteReference(reference) {
    return Object.freeze({
        quoteId: reference.quoteId,
        quoteVersion: reference.quoteVersion,
    });
}
//# sourceMappingURL=invoice-quote-reference.js.map