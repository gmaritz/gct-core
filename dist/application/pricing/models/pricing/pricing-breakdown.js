"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingBreakdown = createPricingBreakdown;
const pricing_line_item_1 = require("./pricing-line-item");
function createPricingBreakdown(breakdown) {
    return Object.freeze({
        lineItems: Object.freeze(breakdown.lineItems.map(pricing_line_item_1.createPricingLineItem)),
    });
}
//# sourceMappingURL=pricing-breakdown.js.map