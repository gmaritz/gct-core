"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceOperationExecution = createInvoiceOperationExecution;
const invoice_engine_error_1 = require("./invoice-engine-error");
function createInvoiceOperationExecution(input) {
    return Object.freeze({
        success: input.success,
        invoice: input.invoice,
        financialImpact: input.financialImpact
            ? Object.freeze({
                currency: input.financialImpact.currency,
                totalObligation: input.financialImpact.totalObligation,
                previousAmountPaid: input.financialImpact.previousAmountPaid,
                newAmountPaid: input.financialImpact.newAmountPaid,
                previousBalanceDue: input.financialImpact.previousBalanceDue,
                newBalanceDue: input.financialImpact.newBalanceDue,
                previousRefundableAmount: input.financialImpact.previousRefundableAmount,
                newRefundableAmount: input.financialImpact.newRefundableAmount,
            })
            : undefined,
        errors: Object.freeze([...(input.errors ?? []).map(invoice_engine_error_1.createInvoiceEngineError)]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
    });
}
//# sourceMappingURL=invoice-operation-execution.js.map