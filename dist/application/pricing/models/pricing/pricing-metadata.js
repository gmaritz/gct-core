"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingMetadata = createPricingMetadata;
function createPricingMetadata(metadata) {
    return Object.freeze({
        createdAt: new Date(metadata.createdAt.getTime()),
        updatedAt: new Date(metadata.updatedAt.getTime()),
        version: metadata.version,
        source: metadata.source,
    });
}
//# sourceMappingURL=pricing-metadata.js.map