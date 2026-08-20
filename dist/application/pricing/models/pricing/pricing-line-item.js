"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingLineItem = createPricingLineItem;
const money_1 = require("../money");
function createPricingLineItem(item) {
    return Object.freeze({
        code: item.code,
        label: item.label,
        unitAmount: (0, money_1.createMoney)(item.unitAmount),
        totalAmount: (0, money_1.createMoney)(item.totalAmount),
        quantity: item.quantity,
        metadata: item.metadata ? Object.freeze({ ...item.metadata }) : undefined,
    });
}
//# sourceMappingURL=pricing-line-item.js.map