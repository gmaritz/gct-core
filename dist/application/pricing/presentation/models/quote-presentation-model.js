"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuotePresentationModel = createQuotePresentationModel;
function createQuotePresentationModel(model) {
    return Object.freeze({
        quoteStatus: model.quoteStatus,
        validityPeriod: model.validityPeriod,
        expiresAt: new Date(model.expiresAt.getTime()),
        commercialNotes: Object.freeze([...(model.commercialNotes ?? [])]),
        quotationReference: model.quotationReference,
    });
}
//# sourceMappingURL=quote-presentation-model.js.map