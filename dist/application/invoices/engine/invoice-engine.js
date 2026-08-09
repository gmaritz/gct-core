"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEngine = void 0;
const policies_1 = require("../policies");
const models_1 = require("./models");
const invoice_engine_context_1 = require("./models/invoice-engine-context");
const invoice_execution_context_1 = require("./models/invoice-execution-context");
const operations_1 = require("./operations");
function defaultHandlers() {
    return Object.freeze([
        new operations_1.InvoiceCreateOperation(),
        new operations_1.InvoiceIssueOperation(),
        new operations_1.InvoicePaymentOperation(),
        new operations_1.InvoiceCancellationOperation(),
        new operations_1.InvoiceVoidOperation(),
        new operations_1.InvoiceRefundOperation(),
    ]);
}
function toPolicyErrors(outcome) {
    if (outcome === policies_1.InvoicePolicyOutcome.REQUIRE_ACTION) {
        return "Invoice policy requires action before execution.";
    }
    return "Invoice policy denied operation execution.";
}
class InvoiceEngine {
    constructor(handlers = defaultHandlers()) {
        this.operationHandlers = new Map(handlers.map((handler) => [handler.operation, handler]));
    }
    async execute(request) {
        const engineContext = (0, invoice_engine_context_1.createInvoiceEngineContext)(request);
        const executionContext = (0, invoice_execution_context_1.createInvoiceExecutionContext)(engineContext);
        if (!executionContext.validationResult.success) {
            return (0, models_1.createInvoiceEngineResult)({
                success: false,
                operation: executionContext.operation,
                outcome: models_1.InvoiceEngineOutcome.REJECTED,
                invoice: executionContext.invoice ?? null,
                validationResult: executionContext.validationResult,
                policyEvaluation: executionContext.policyEvaluation,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: models_1.InvoiceEngineErrorCode.VALIDATION_FAILED,
                        message: "Invoice validation failed; execution cannot proceed.",
                    }),
                ],
                warnings: executionContext.validationResult.warnings,
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: executionContext.metadata.requestId,
                    source: executionContext.metadata.source,
                    stages: [...executionContext.metadata.stages, "VALIDATION_GUARD"],
                },
            });
        }
        if (!executionContext.policyEvaluation.permitted) {
            const errorCode = executionContext.policyEvaluation.outcome === policies_1.InvoicePolicyOutcome.REQUIRE_ACTION
                ? models_1.InvoiceEngineErrorCode.POLICY_ACTION_REQUIRED
                : models_1.InvoiceEngineErrorCode.POLICY_DENIED;
            return (0, models_1.createInvoiceEngineResult)({
                success: false,
                operation: executionContext.operation,
                outcome: executionContext.policyEvaluation.outcome === policies_1.InvoicePolicyOutcome.REQUIRE_ACTION
                    ? models_1.InvoiceEngineOutcome.PENDING_ACTION
                    : models_1.InvoiceEngineOutcome.REJECTED,
                invoice: executionContext.invoice ?? null,
                validationResult: executionContext.validationResult,
                policyEvaluation: executionContext.policyEvaluation,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: errorCode,
                        message: toPolicyErrors(executionContext.policyEvaluation.outcome),
                    }),
                ],
                warnings: executionContext.policyEvaluation.warnings,
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: executionContext.metadata.requestId,
                    source: executionContext.metadata.source,
                    stages: [...executionContext.metadata.stages, "POLICY_GUARD"],
                },
            });
        }
        const handler = this.operationHandlers.get(executionContext.operation);
        if (!handler) {
            return (0, models_1.createInvoiceEngineResult)({
                success: false,
                operation: executionContext.operation,
                outcome: models_1.InvoiceEngineOutcome.REJECTED,
                invoice: executionContext.invoice ?? null,
                validationResult: executionContext.validationResult,
                policyEvaluation: executionContext.policyEvaluation,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: models_1.InvoiceEngineErrorCode.INVALID_OPERATION,
                        message: `Unsupported invoice operation '${executionContext.operation}'.`,
                    }),
                ],
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: executionContext.metadata.requestId,
                    source: executionContext.metadata.source,
                    stages: [...executionContext.metadata.stages, "DISPATCH"],
                },
            });
        }
        const operationResult = this.executeOperation(handler, executionContext);
        if (!operationResult.success || !operationResult.invoice) {
            return (0, models_1.createInvoiceEngineResult)({
                success: false,
                operation: executionContext.operation,
                outcome: models_1.InvoiceEngineOutcome.REJECTED,
                invoice: executionContext.invoice ?? null,
                validationResult: executionContext.validationResult,
                policyEvaluation: executionContext.policyEvaluation,
                errors: operationResult.errors,
                warnings: operationResult.warnings,
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: executionContext.metadata.requestId,
                    source: executionContext.metadata.source,
                    stages: [...executionContext.metadata.stages, "OPERATION_FAILED"],
                },
            });
        }
        const completed = (0, invoice_execution_context_1.withExecutionResultingInvoice)(executionContext, operationResult.invoice);
        return (0, models_1.createInvoiceEngineResult)({
            success: true,
            operation: executionContext.operation,
            outcome: models_1.InvoiceEngineOutcome.EXECUTED,
            invoice: completed.resultingInvoice,
            validationResult: completed.validationResult,
            policyEvaluation: completed.policyEvaluation,
            financialImpact: operationResult.financialImpact,
            errors: operationResult.errors,
            warnings: operationResult.warnings,
            metadata: {
                completedAt: new Date(),
                version: "1.0.0",
                requestId: completed.metadata.requestId,
                source: completed.metadata.source,
                stages: completed.metadata.stages,
            },
        });
    }
    executeOperation(handler, context) {
        try {
            return handler.execute(context);
        }
        catch (error) {
            return (0, models_1.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: models_1.InvoiceEngineErrorCode.CALCULATION_ERROR,
                        message: error instanceof Error ? error.message : "Invoice operation execution failed.",
                    }),
                ],
            });
        }
    }
}
exports.InvoiceEngine = InvoiceEngine;
//# sourceMappingURL=invoice-engine.js.map