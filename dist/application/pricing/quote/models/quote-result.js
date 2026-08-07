"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuoteResult = createQuoteResult;
const models_1 = require("../../models");
const quote_lifecycle_1 = require("./quote-lifecycle");
const quote_reference_1 = require("./quote-reference");
function createQuoteResult(input) {
    return Object.freeze({
        successful: input.successful,
        quote: input.quote ? (0, models_1.createQuote)(input.quote) : null,
        quoteReference: input.quoteReference ? (0, quote_reference_1.createQuoteReference)(input.quoteReference) : null,
        lifecycle: input.lifecycle ? (0, quote_lifecycle_1.createQuoteLifecycle)(input.lifecycle) : null,
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            generatedAt: new Date(input.metadata.generatedAt.getTime()),
            version: input.metadata.version,
            requestId: input.metadata.requestId,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=quote-result.js.map