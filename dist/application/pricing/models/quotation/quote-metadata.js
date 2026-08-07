"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuoteMetadata = createQuoteMetadata;
function createQuoteMetadata(metadata) {
    return Object.freeze({
        createdAt: new Date(metadata.createdAt.getTime()),
        expiresAt: new Date(metadata.expiresAt.getTime()),
        version: metadata.version,
        source: metadata.source,
    });
}
//# sourceMappingURL=quote-metadata.js.map