"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceVoidOperation = void 0;
const aggregate_1 = require("../../aggregate");
const models_1 = require("../../models");
const policies_1 = require("../../policies");
const models_2 = require("../models");
const operation_support_1 = require("./operation-support");
class InvoiceVoidOperation {
    constructor() {
        this.operation = policies_1.InvoiceOperation.VOID;
    }
    execute(context) {
        const invoice = (0, operation_support_1.ensurePresent)(context.invoice, "Invoice is required for void operation.");
        const restored = aggregate_1.Invoice.restore({
            ...(0, operation_support_1.toInvoiceComposition)(invoice),
            status: models_1.InvoiceStatus.VOID,
            metadata: (0, operation_support_1.resolveMetadata)(invoice.metadata),
        });
        const financialImpact = {
            currency: restored.financialObligation.currency,
            totalObligation: restored.financialObligation.totalAmount,
            previousAmountPaid: invoice.amountPaid,
            newAmountPaid: restored.amountPaid,
            previousBalanceDue: invoice.balanceDue,
            newBalanceDue: restored.balanceDue,
            previousRefundableAmount: invoice.refundableAmount,
            newRefundableAmount: restored.refundableAmount,
        };
        return (0, models_2.createInvoiceOperationExecution)({
            success: true,
            invoice: restored,
            financialImpact,
        });
    }
}
exports.InvoiceVoidOperation = InvoiceVoidOperation;
//# sourceMappingURL=invoice-void-operation.js.map