"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceIssueOperation = void 0;
const aggregate_1 = require("../../aggregate");
const models_1 = require("../../models");
const policies_1 = require("../../policies");
const models_2 = require("../models");
const operation_support_1 = require("./operation-support");
class InvoiceIssueOperation {
    constructor() {
        this.operation = policies_1.InvoiceOperation.ISSUE;
    }
    execute(context) {
        const invoice = (0, operation_support_1.ensurePresent)(context.invoice, "Invoice is required for issue operation.");
        if (invoice.status !== models_1.InvoiceStatus.DRAFT) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION,
                        message: `Invoice in status '${invoice.status}' cannot be issued.`,
                    }),
                ],
            });
        }
        const issued = aggregate_1.Invoice.restore({
            ...(0, operation_support_1.toInvoiceComposition)(invoice),
            status: models_1.InvoiceStatus.ISSUED,
            metadata: (0, operation_support_1.resolveMetadata)(invoice.metadata),
        });
        const financialImpact = {
            currency: issued.financialObligation.currency,
            totalObligation: issued.financialObligation.totalAmount,
            previousAmountPaid: invoice.amountPaid,
            newAmountPaid: issued.amountPaid,
            previousBalanceDue: invoice.balanceDue,
            newBalanceDue: issued.balanceDue,
            previousRefundableAmount: invoice.refundableAmount,
            newRefundableAmount: issued.refundableAmount,
        };
        return (0, models_2.createInvoiceOperationExecution)({
            success: true,
            invoice: issued,
            financialImpact,
        });
    }
}
exports.InvoiceIssueOperation = InvoiceIssueOperation;
//# sourceMappingURL=invoice-issue-operation.js.map