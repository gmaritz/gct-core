"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceExecutionContext = createInvoiceExecutionContext;
exports.withExecutionResultingInvoice = withExecutionResultingInvoice;
const invoice_engine_context_1 = require("./invoice-engine-context");
function createInvoiceExecutionContext(engineContext) {
    return Object.freeze({
        operation: engineContext.operation,
        validationRequest: engineContext.validationRequest,
        validationResult: engineContext.validationResult,
        policyEvaluation: engineContext.policyEvaluation,
        operationInput: engineContext.operationInput,
        invoice: engineContext.invoice,
        resultingInvoice: null,
        metadata: engineContext.metadata,
    });
}
function withExecutionResultingInvoice(context, resultingInvoice) {
    return Object.freeze({
        ...context,
        resultingInvoice,
        metadata: (0, invoice_engine_context_1.withInvoiceEngineStage)(context.metadata, "OPERATION"),
    });
}
//# sourceMappingURL=invoice-execution-context.js.map