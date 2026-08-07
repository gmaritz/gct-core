"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMarkup = createMarkup;
const money_1 = require("../money");
function createMarkup(markup) {
    return Object.freeze({
        code: markup.code,
        label: markup.label,
        amount: (0, money_1.createMoney)(markup.amount),
    });
}
//# sourceMappingURL=markup.js.map