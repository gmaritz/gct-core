"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFee = createFee;
const money_1 = require("../money");
function createFee(fee) {
    return Object.freeze({
        code: fee.code,
        label: fee.label,
        amount: (0, money_1.createMoney)(fee.amount),
    });
}
//# sourceMappingURL=fee.js.map