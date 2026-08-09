"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceRequestValidator = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function resolveReservationReference(request) {
    return request.reservationReference ?? request.invoice?.reservationReference ?? null;
}
function resolveCustomerReference(request) {
    return request.customerReference ?? request.invoice?.customerReference ?? null;
}
function resolveQuoteReference(request) {
    return request.quoteReference ?? request.invoice?.quoteReference ?? null;
}
function resolvePricingSnapshot(request) {
    return request.pricingSnapshot ?? request.invoice?.pricingSnapshot ?? null;
}
function resolveFinancialObligation(request) {
    return request.financialObligation ?? request.invoice?.financialObligation ?? null;
}
class InvoiceRequestValidator {
    validate(request) {
        const errors = [];
        if (!request) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_REQUEST,
                message: "Invoice request is required.",
                severity: "CRITICAL",
            }));
            return (0, models_1.createInvoiceValidationResult)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoiceRequestValidator",
                },
            });
        }
        if (request.requiresExistingInvoice && isBlank(request.invoice?.identity?.id)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_INVOICE_IDENTIFIER,
                message: "Invoice identifier is required.",
                severity: "CRITICAL",
            }));
        }
        const reservationReference = resolveReservationReference(request);
        if (isBlank(reservationReference?.reservationId)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE,
                message: "Invoice reservation reference is required.",
                severity: "CRITICAL",
            }));
        }
        const customerReference = resolveCustomerReference(request);
        const customerId = customerReference?.customerId;
        const travellerId = customerReference?.travellerId;
        if (isBlank(customerId) && isBlank(travellerId)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_CUSTOMER_REFERENCE,
                message: "Invoice customer or traveller reference is required.",
                severity: "CRITICAL",
            }));
        }
        const quoteReference = resolveQuoteReference(request);
        if (isBlank(quoteReference?.quoteId) || isBlank(quoteReference?.quoteVersion)) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE,
                message: "Invoice quote reference is required.",
                severity: "CRITICAL",
            }));
        }
        const pricingSnapshot = resolvePricingSnapshot(request);
        if (!pricingSnapshot) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT,
                message: "Invoice pricing snapshot is required.",
                severity: "CRITICAL",
            }));
        }
        const financialObligation = resolveFinancialObligation(request);
        if (!financialObligation) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.REQUEST,
                code: models_1.InvoiceValidationErrorCode.MISSING_FINANCIAL_OBLIGATION,
                message: "Invoice financial obligation is required.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_1.createInvoiceValidationResult)({
            stage: models_1.InvoiceValidationStage.REQUEST,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "InvoiceRequestValidator",
            },
        });
    }
}
exports.InvoiceRequestValidator = InvoiceRequestValidator;
//# sourceMappingURL=invoice-request-validator.js.map