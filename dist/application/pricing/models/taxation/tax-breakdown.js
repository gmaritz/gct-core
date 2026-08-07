"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxBreakdown = createTaxBreakdown;
const money_1 = require("../money");
const tax_1 = require("./tax");
function createTaxBreakdown(breakdown) {
    return Object.freeze({
        entries: Object.freeze(breakdown.entries.map(tax_1.createTax)),
        total: (0, money_1.createMoney)(breakdown.total),
    });
}
//# sourceMappingURL=tax-breakdown.js.map