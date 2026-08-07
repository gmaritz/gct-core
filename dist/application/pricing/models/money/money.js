"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMoney = createMoney;
exports.equalsMoney = equalsMoney;
function createMoney(value) {
    return Object.freeze({
        amount: value.amount,
        currency: value.currency,
    });
}
function equalsMoney(left, right) {
    return left.amount === right.amount && left.currency === right.currency;
}
//# sourceMappingURL=money.js.map