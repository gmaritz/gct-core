"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePaymentPolicy = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
class InvoicePaymentPolicy {
    evaluate(context) {
        if (context.operation !== models_2.InvoiceOperation.ACCEPT_PAYMENT) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoicePaymentPolicy",
                outcome: models_2.InvoicePolicyOutcome.IGNORE,
                priority: models_2.InvoicePolicyPriority.LOW,
                observations: ["Payment policy does not apply to the requested operation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePaymentPolicy",
                },
            });
        }
        if (!context.invoice) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoicePaymentPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice is required to evaluate payment acceptance."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePaymentPolicy",
                },
            });
        }
        if (!context.validationResult.success) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoicePaymentPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice validation must succeed before payment policy can allow processing."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePaymentPolicy",
                },
            });
        }
        const status = context.invoice.status;
        if (status === models_1.InvoiceStatus.DRAFT) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoicePaymentPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Draft invoice cannot accept payment."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePaymentPolicy",
                },
            });
        }
        if (status === models_1.InvoiceStatus.PAID || status === models_1.InvoiceStatus.CANCELLED || status === models_1.InvoiceStatus.VOID) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoicePaymentPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: [`Invoice in status '${status}' cannot accept payment.`],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePaymentPolicy",
                },
            });
        }
        const warnings = status === models_1.InvoiceStatus.OVERDUE ? ["Invoice is overdue."] : [];
        if (context.reviewRequirements?.paymentReviewRequired) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoicePaymentPolicy",
                outcome: models_2.InvoicePolicyOutcome.REQUIRE_ACTION,
                priority: models_2.InvoicePolicyPriority.HIGH,
                requiredActions: [models_2.InvoiceRequiredAction.PAYMENT_REVIEW],
                warnings,
                observations: ["Payment review is required before payment acceptance."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePaymentPolicy",
                },
            });
        }
        return (0, models_2.createInvoicePolicyResult)({
            policyName: "InvoicePaymentPolicy",
            outcome: models_2.InvoicePolicyOutcome.ALLOW,
            priority: models_2.InvoicePolicyPriority.NORMAL,
            warnings,
            observations: ["Invoice may accept payment."],
            metadata: {
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "InvoicePaymentPolicy",
            },
        });
    }
}
exports.InvoicePaymentPolicy = InvoicePaymentPolicy;
//# sourceMappingURL=invoice-payment-policy.js.map