"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingTotal = createPricingTotal;
const money_1 = require("../money");
function createPricingTotal(total) {
    return Object.freeze({
        subtotal: (0, money_1.createMoney)(total.subtotal),
        taxTotal: (0, money_1.createMoney)(total.taxTotal),
        feeTotal: (0, money_1.createMoney)(total.feeTotal),
        discountTotal: (0, money_1.createMoney)(total.discountTotal),
        markupTotal: (0, money_1.createMoney)(total.markupTotal),
        commissionTotal: (0, money_1.createMoney)(total.commissionTotal),
        grandTotal: (0, money_1.createMoney)(total.grandTotal),
    });
}
//# sourceMappingURL=pricing-total.js.map