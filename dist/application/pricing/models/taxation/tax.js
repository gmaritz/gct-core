"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTax = createTax;
const money_1 = require("../money");
function createTax(tax) {
    return Object.freeze({
        code: tax.code,
        type: tax.type,
        amount: (0, money_1.createMoney)(tax.amount),
        description: tax.description,
    });
}
//# sourceMappingURL=tax.js.map