"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuote = createQuote;
const money_1 = require("../money");
const quote_item_1 = require("./quote-item");
const quote_metadata_1 = require("./quote-metadata");
function createQuote(quote) {
    return Object.freeze({
        id: quote.id,
        status: quote.status,
        items: Object.freeze(quote.items.map(quote_item_1.createQuoteItem)),
        total: (0, money_1.createMoney)(quote.total),
        metadata: (0, quote_metadata_1.createQuoteMetadata)(quote.metadata),
    });
}
//# sourceMappingURL=quote.js.map