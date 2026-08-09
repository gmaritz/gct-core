"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEngineOutcome = void 0;
exports.createInvoiceEngineResult = createInvoiceEngineResult;
const invoice_engine_error_1 = require("./invoice-engine-error");
var InvoiceEngineOutcome;
(function (InvoiceEngineOutcome) {
    InvoiceEngineOutcome["EXECUTED"] = "EXECUTED";
    InvoiceEngineOutcome["REJECTED"] = "REJECTED";
    InvoiceEngineOutcome["PENDING_ACTION"] = "PENDING_ACTION";
})(InvoiceEngineOutcome || (exports.InvoiceEngineOutcome = InvoiceEngineOutcome = {}));
function createInvoiceEngineResult(input) {
    return Object.freeze({
        success: input.success,
        operation: input.operation,
        outcome: input.outcome,
        invoice: input.invoice ?? null,
        validationResult: input.validationResult,
        policyEvaluation: input.policyEvaluation,
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
        metadata: Object.freeze({
            completedAt: new Date(input.metadata.completedAt.getTime()),
            version: input.metadata.version,
            requestId: input.metadata.requestId,
            source: input.metadata.source,
            stages: Object.freeze([...(input.metadata.stages ?? [])]),
        }),
    });
}
//# sourceMappingURL=invoice-engine-result.js.map