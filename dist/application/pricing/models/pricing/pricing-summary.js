"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingSummary = createPricingSummary;
function createPricingSummary(summary) {
    return Object.freeze({
        productId: summary.productId,
        productType: summary.productType,
        description: summary.description,
    });
}
//# sourceMappingURL=pricing-summary.js.map