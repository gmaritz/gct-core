"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCreateOperation = void 0;
const aggregate_1 = require("../../aggregate");
const policies_1 = require("../../policies");
const models_1 = require("../models");
class InvoiceCreateOperation {
    constructor() {
        this.operation = policies_1.InvoiceOperation.CREATE;
    }
    execute(context) {
        if (context.operationInput?.operation !== policies_1.InvoiceOperation.CREATE) {
            return (0, models_1.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: models_1.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
                        message: "Invoice create operation input is required.",
                    }),
                ],
            });
        }
        const created = aggregate_1.Invoice.create(context.operationInput.composition);
        const financialImpact = {
            currency: created.financialObligation.currency,
            totalObligation: created.financialObligation.totalAmount,
            previousAmountPaid: 0,
            newAmountPaid: created.amountPaid,
            previousBalanceDue: created.financialObligation.totalAmount,
            newBalanceDue: created.balanceDue,
            previousRefundableAmount: 0,
            newRefundableAmount: created.refundableAmount,
        };
        return (0, models_1.createInvoiceOperationExecution)({
            success: true,
            invoice: created,
            financialImpact,
        });
    }
}
exports.InvoiceCreateOperation = InvoiceCreateOperation;
//# sourceMappingURL=invoice-create-operation.js.map