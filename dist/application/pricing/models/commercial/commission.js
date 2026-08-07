"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommission = createCommission;
const money_1 = require("../money");
function createCommission(commission) {
    return Object.freeze({
        code: commission.code,
        label: commission.label,
        amount: (0, money_1.createMoney)(commission.amount),
    });
}
//# sourceMappingURL=commission.js.map