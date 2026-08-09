"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCancellationPolicy = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
class InvoiceCancellationPolicy {
    evaluate(context) {
        if (context.operation !== models_2.InvoiceOperation.CANCEL) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceCancellationPolicy",
                outcome: models_2.InvoicePolicyOutcome.IGNORE,
                priority: models_2.InvoicePolicyPriority.LOW,
                observations: ["Cancellation policy does not apply to the requested operation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCancellationPolicy",
                },
            });
        }
        if (!context.invoice) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceCancellationPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice is required to evaluate a cancellation request."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCancellationPolicy",
                },
            });
        }
        if (!context.validationResult.success) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceCancellationPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: ["Invoice validation must succeed before cancellation policy can allow processing."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCancellationPolicy",
                },
            });
        }
        const status = context.invoice.status;
        if (status === models_1.InvoiceStatus.PAID) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceCancellationPolicy",
                outcome: models_2.InvoicePolicyOutcome.REQUIRE_ACTION,
                priority: models_2.InvoicePolicyPriority.HIGH,
                requiredActions: [models_2.InvoiceRequiredAction.CANCELLATION_REVIEW],
                observations: ["Paid invoice cancellation requires cancellation review."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCancellationPolicy",
                },
            });
        }
        if (status === models_1.InvoiceStatus.PARTIALLY_PAID && context.reviewRequirements?.cancellationReviewRequired) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceCancellationPolicy",
                outcome: models_2.InvoicePolicyOutcome.REQUIRE_ACTION,
                priority: models_2.InvoicePolicyPriority.HIGH,
                requiredActions: [models_2.InvoiceRequiredAction.CANCELLATION_REVIEW],
                observations: ["Partially paid invoice cancellation requires cancellation review."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCancellationPolicy",
                },
            });
        }
        if (status === models_1.InvoiceStatus.CANCELLED || status === models_1.InvoiceStatus.VOID) {
            return (0, models_2.createInvoicePolicyResult)({
                policyName: "InvoiceCancellationPolicy",
                outcome: models_2.InvoicePolicyOutcome.DENY,
                priority: models_2.InvoicePolicyPriority.HIGH,
                errors: [`Invoice in status '${status}' cannot be cancelled.`],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCancellationPolicy",
                },
            });
        }
        return (0, models_2.createInvoicePolicyResult)({
            policyName: "InvoiceCancellationPolicy",
            outcome: models_2.InvoicePolicyOutcome.ALLOW,
            priority: models_2.InvoicePolicyPriority.NORMAL,
            observations: ["Invoice cancellation is permitted for current status."],
            metadata: {
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "InvoiceCancellationPolicy",
            },
        });
    }
}
exports.InvoiceCancellationPolicy = InvoiceCancellationPolicy;
//# sourceMappingURL=invoice-cancellation-policy.js.map