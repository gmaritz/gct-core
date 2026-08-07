"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuoteItem = createQuoteItem;
const money_1 = require("../money");
function createQuoteItem(item) {
    return Object.freeze({
        code: item.code,
        label: item.label,
        amount: (0, money_1.createMoney)(item.amount),
        quantity: item.quantity,
    });
}
//# sourceMappingURL=quote-item.js.map