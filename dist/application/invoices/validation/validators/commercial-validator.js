"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialValidator = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
class CommercialValidator {
    validate(request) {
        const errors = [];
        const invoiceQuote = request.invoice?.quoteReference;
        const requestQuote = request.quoteReference;
        const quoteReference = requestQuote ?? invoiceQuote;
        const invoicePricing = request.invoice?.pricingSnapshot;
        const requestPricing = request.pricingSnapshot;
        const pricingSnapshot = requestPricing ?? invoicePricing;
        const obligation = request.financialObligation ?? request.invoice?.financialObligation;
        if (!quoteReference || isBlank(quoteReference.quoteId) || isBlank(quoteReference.quoteVersion)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                code: models_1.InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE,
                message: "Invoice quote reference is required.",
                severity: "CRITICAL",
            }));
        }
        if (!pricingSnapshot) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                code: models_1.InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT,
                message: "Invoice pricing snapshot is required.",
                severity: "CRITICAL",
            }));
            return (0, models_1.createInvoiceValidationResult)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "CommercialValidator",
                },
            });
        }
        if (isBlank(pricingSnapshot.snapshotId) || isBlank(pricingSnapshot.pricingId) || isBlank(pricingSnapshot.version)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                code: models_1.InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT,
                message: "Invoice pricing snapshot reference is invalid.",
                severity: "CRITICAL",
            }));
        }
        if (isBlank(pricingSnapshot.currency)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                code: models_1.InvoiceValidationErrorCode.INVALID_CURRENCY,
                message: "Invoice pricing currency is required.",
                severity: "CRITICAL",
            }));
        }
        if (!isFiniteNumber(pricingSnapshot.totalAmount) || pricingSnapshot.totalAmount < 0) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                code: models_1.InvoiceValidationErrorCode.INVALID_TOTAL_AMOUNT,
                message: "Invoice pricing total amount is invalid.",
                severity: "CRITICAL",
            }));
        }
        if (invoiceQuote && requestQuote) {
            if (invoiceQuote.quoteId !== requestQuote.quoteId || invoiceQuote.quoteVersion !== requestQuote.quoteVersion) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.COMMERCIAL,
                    code: models_1.InvoiceValidationErrorCode.QUOTE_REFERENCE_INCONSISTENT,
                    message: "Invoice quote reference is inconsistent with the supplied validation context.",
                    severity: "CRITICAL",
                }));
            }
        }
        if (invoicePricing && requestPricing) {
            if (invoicePricing.snapshotId !== requestPricing.snapshotId
                || invoicePricing.pricingId !== requestPricing.pricingId
                || invoicePricing.version !== requestPricing.version) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.COMMERCIAL,
                    code: models_1.InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT,
                    message: "Invoice pricing snapshot is inconsistent with the supplied validation context.",
                    severity: "CRITICAL",
                }));
            }
        }
        if (obligation && !isBlank(pricingSnapshot.currency) && !isBlank(obligation.currency) && pricingSnapshot.currency !== obligation.currency) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.COMMERCIAL,
                code: models_1.InvoiceValidationErrorCode.PRICING_CURRENCY_MISMATCH,
                message: "Invoice pricing currency must match financial obligation currency.",
                severity: "CRITICAL",
            }));
        }
        if (obligation && isFiniteNumber(pricingSnapshot.totalAmount) && isFiniteNumber(obligation.totalAmount)) {
            if (pricingSnapshot.totalAmount !== obligation.totalAmount) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.COMMERCIAL,
                    code: models_1.InvoiceValidationErrorCode.PRICING_TOTAL_MISMATCH,
                    message: "Invoice pricing total does not match the financial obligation total.",
                    severity: "CRITICAL",
                }));
            }
        }
        return (0, models_1.createInvoiceValidationResult)({
            stage: models_1.InvoiceValidationStage.COMMERCIAL,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "CommercialValidator",
            },
        });
    }
}
exports.CommercialValidator = CommercialValidator;
//# sourceMappingURL=commercial-validator.js.map