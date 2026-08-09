"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCommercialPolicy = void 0;
const validation_1 = require("../../validation");
const models_1 = require("../models");
const commercialErrorCodes = new Set([
    validation_1.InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE,
    validation_1.InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT,
    validation_1.InvoiceValidationErrorCode.MISSING_FINANCIAL_OBLIGATION,
    validation_1.InvoiceValidationErrorCode.INVALID_CURRENCY,
    validation_1.InvoiceValidationErrorCode.INVALID_TOTAL_AMOUNT,
    validation_1.InvoiceValidationErrorCode.QUOTE_REFERENCE_INCONSISTENT,
    validation_1.InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT,
    validation_1.InvoiceValidationErrorCode.PRICING_CURRENCY_MISMATCH,
    validation_1.InvoiceValidationErrorCode.PRICING_TOTAL_MISMATCH,
]);
const commercialOperations = new Set([
    models_1.InvoiceOperation.ISSUE,
    models_1.InvoiceOperation.ACCEPT_PAYMENT,
    models_1.InvoiceOperation.CANCEL,
    models_1.InvoiceOperation.VOID,
    models_1.InvoiceOperation.REFUND,
]);
class InvoiceCommercialPolicy {
    evaluate(context) {
        if (!commercialOperations.has(context.operation)) {
            return (0, models_1.createInvoicePolicyResult)({
                policyName: "InvoiceCommercialPolicy",
                outcome: models_1.InvoicePolicyOutcome.IGNORE,
                priority: models_1.InvoicePolicyPriority.LOW,
                observations: ["Commercial policy does not apply to the requested operation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCommercialPolicy",
                },
            });
        }
        if (!context.validationResult.success) {
            return (0, models_1.createInvoicePolicyResult)({
                policyName: "InvoiceCommercialPolicy",
                outcome: models_1.InvoicePolicyOutcome.DENY,
                priority: models_1.InvoicePolicyPriority.CRITICAL,
                errors: ["Invoice validation must succeed before commercial policy evaluation can allow processing."],
                observations: ["Commercial policy interpreted validation failure as a commercial deny condition."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCommercialPolicy",
                },
            });
        }
        const hasCriticalCommercialError = context.validationResult.errors.some((error) => error.severity === "CRITICAL" && commercialErrorCodes.has(error.code));
        if (hasCriticalCommercialError) {
            return (0, models_1.createInvoicePolicyResult)({
                policyName: "InvoiceCommercialPolicy",
                outcome: models_1.InvoicePolicyOutcome.DENY,
                priority: models_1.InvoicePolicyPriority.CRITICAL,
                errors: ["Commercial validation reported a critical failure for this invoice."],
                observations: ["Commercial policy denied operation based on validation-commercial incompatibility."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCommercialPolicy",
                },
            });
        }
        const invoice = context.invoice;
        if (!invoice) {
            return (0, models_1.createInvoicePolicyResult)({
                policyName: "InvoiceCommercialPolicy",
                outcome: models_1.InvoicePolicyOutcome.DENY,
                priority: models_1.InvoicePolicyPriority.HIGH,
                errors: ["Invoice is required for commercial policy evaluation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCommercialPolicy",
                },
            });
        }
        const quoteMissing = invoice.quoteReference.quoteId.trim().length === 0 || invoice.quoteReference.quoteVersion.trim().length === 0;
        const pricingMissing = invoice.pricingSnapshot.snapshotId.trim().length === 0
            || invoice.pricingSnapshot.pricingId.trim().length === 0
            || invoice.pricingSnapshot.version.trim().length === 0;
        const obligationMissing = invoice.financialObligation.currency.trim().length === 0;
        const commercialInconsistent = invoice.pricingSnapshot.currency !== invoice.financialObligation.currency
            || invoice.pricingSnapshot.totalAmount !== invoice.financialObligation.totalAmount;
        if (quoteMissing || pricingMissing || obligationMissing || commercialInconsistent) {
            return (0, models_1.createInvoicePolicyResult)({
                policyName: "InvoiceCommercialPolicy",
                outcome: models_1.InvoicePolicyOutcome.DENY,
                priority: models_1.InvoicePolicyPriority.HIGH,
                errors: ["Invoice commercial state is inconsistent for the requested operation."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceCommercialPolicy",
                },
            });
        }
        return (0, models_1.createInvoicePolicyResult)({
            policyName: "InvoiceCommercialPolicy",
            outcome: models_1.InvoicePolicyOutcome.ALLOW,
            priority: models_1.InvoicePolicyPriority.NORMAL,
            observations: ["Commercial integrity checks passed for the requested operation."],
            metadata: {
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "InvoiceCommercialPolicy",
            },
        });
    }
}
exports.InvoiceCommercialPolicy = InvoiceCommercialPolicy;
//# sourceMappingURL=invoice-commercial-policy.js.map