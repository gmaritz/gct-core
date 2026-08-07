"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiscount = createDiscount;
const money_1 = require("../money");
function createDiscount(discount) {
    return Object.freeze({
        code: discount.code,
        label: discount.label,
        amount: (0, money_1.createMoney)(discount.amount),
    });
}
//# sourceMappingURL=discount.js.map