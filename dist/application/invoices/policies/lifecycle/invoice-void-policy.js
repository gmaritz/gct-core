"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceVoidPolicy = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
class InvoiceVoidPolicy {
    evaluate(context) {
        if (context.operation !== models_2.InvoiceOperation.VOID) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceVoidPolicy",
                outcome: models_2.InvoicePolicyOutcome.IGNORE,
                priority: models_2.InvoicePolicyPriority.LOW,
                observations: ["Void policy does not apply to the requested operation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceVoidPolicy",
                },
            });
        }
        if (!context.invoice) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceVoidPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice is required to evaluate a void request."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceVoidPolicy",
                },
            });
        }
        if (!context.validationResult.success) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceVoidPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice validation must succeed before void policy can allow processing."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceVoidPolicy",
                },
            });
        }
        const status = context.invoice.status;
        if (status === models_1.InvoiceStatus.DRAFT || status === models_1.InvoiceStatus.ISSUED) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceVoidPolicy",
                outcome: models_2.InvoicePolicyOutcome.ALLOW,
                priority: models_2.InvoicePolicyPriority.NORMAL,
                observations: ["Invoice may be voided in current status."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceVoidPolicy",
                },
            });
        }
        if (status === models_1.InvoiceStatus.PARTIALLY_PAID || status === models_1.InvoiceStatus.OVERDUE) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceVoidPolicy",
                outcome: models_2.InvoicePolicyOutcome.REQUIRE_ACTION,
                priority: models_2.InvoicePolicyPriority.HIGH,
                requiredActions: [models_2.InvoiceRequiredAction.FINANCIAL_REVIEW],
                observations: ["Void request requires financial review for this invoice state."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceVoidPolicy",
                },
            });
        }
        return (0, models_2.createInvoicePolicyResult)({
            policyName: "InvoiceVoidPolicy",
            outcome: models_2.InvoicePolicyOutcome.DENY,
            priority: models_2.InvoicePolicyPriority.HIGH,
            errors: [`Invoice in status '${status}' cannot be voided.`],
            metadata: {
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "InvoiceVoidPolicy",
            },
        });
    }
}
exports.InvoiceVoidPolicy = InvoiceVoidPolicy;
//# sourceMappingURL=invoice-void-policy.js.map