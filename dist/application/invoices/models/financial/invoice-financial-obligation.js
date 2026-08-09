"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceFinancialObligation = createInvoiceFinancialObligation;
function createInvoiceFinancialObligation(obligation) {
    return Object.freeze({
        totalAmount: obligation.totalAmount,
        currency: obligation.currency,
    });
}
//# sourceMappingURL=invoice-financial-obligation.js.map