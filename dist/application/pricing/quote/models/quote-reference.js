"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuoteReference = createQuoteReference;
function createQuoteReference(input) {
    return Object.freeze({
        quotationNumber: input.quotationNumber,
        externalReference: input.externalReference ?? null,
        customerReference: input.customerReference ?? null,
    });
}
//# sourceMappingURL=quote-reference.js.map