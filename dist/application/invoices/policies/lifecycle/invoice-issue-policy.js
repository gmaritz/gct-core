"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceIssuePolicy = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
class InvoiceIssuePolicy {
    evaluate(context) {
        if (context.operation !== models_2.InvoiceOperation.ISSUE) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceIssuePolicy",
                outcome: models_2.InvoicePolicyOutcome.IGNORE,
                priority: models_2.InvoicePolicyPriority.LOW,
                observations: ["Issue policy does not apply to the requested operation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceIssuePolicy",
                },
            });
        }
        if (!context.invoice) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceIssuePolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice is required to evaluate an issue request."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceIssuePolicy",
                },
            });
        }
        if (!context.validationResult.success) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceIssuePolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice validation must succeed before issuing an invoice."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceIssuePolicy",
                },
            });
        }
        const status = context.invoice.status;
        if (status === models_1.InvoiceStatus.DRAFT) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceIssuePolicy",
                outcome: models_2.InvoicePolicyOutcome.ALLOW,
                priority: models_2.InvoicePolicyPriority.NORMAL,
                observations: ["Draft invoice is eligible to be issued."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceIssuePolicy",
                },
            });
        }
        return (0, models_2.createInvoicePolicyResult)({
            policyName: "InvoiceIssuePolicy",
            outcome: models_2.InvoicePolicyOutcome.DENY,
            priority: models_2.InvoicePolicyPriority.HIGH,
            errors: [`Invoice in status '${status}' cannot be issued.`],
            metadata: {
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "InvoiceIssuePolicy",
            },
        });
    }
}
exports.InvoiceIssuePolicy = InvoiceIssuePolicy;
//# sourceMappingURL=invoice-issue-policy.js.map