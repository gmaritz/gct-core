"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestValidator = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
class PaymentRequestValidator {
    validate(request) {
        const errors = [];
        if (!request) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.REQUEST,
                code: models_1.PaymentValidationErrorCode.MISSING_REQUEST,
                message: "Payment request is required.",
                severity: "CRITICAL",
            }));
            return (0, models_1.createPaymentValidationResult)({
                stage: models_1.PaymentValidationStage.REQUEST,
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "PaymentRequestValidator",
                },
            });
        }
        if (isBlank(request.reference?.paymentId)) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.REQUEST,
                code: models_1.PaymentValidationErrorCode.MISSING_PAYMENT_IDENTIFIER,
                message: "Payment identifier is required.",
                severity: "CRITICAL",
            }));
        }
        if (typeof request.paymentMethod === "undefined" || request.paymentMethod === null) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.REQUEST,
                code: models_1.PaymentValidationErrorCode.MISSING_PAYMENT_METHOD,
                message: "Payment method is required.",
                severity: "CRITICAL",
            }));
        }
        if (isBlank(request.currency)) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.REQUEST,
                code: models_1.PaymentValidationErrorCode.MISSING_CURRENCY,
                message: "Payment currency is required.",
                severity: "CRITICAL",
            }));
        }
        if (isBlank(request.reservationSnapshot?.reservationReference)) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.REQUEST,
                code: models_1.PaymentValidationErrorCode.MISSING_RESERVATION_REFERENCE,
                message: "Reservation reference is required.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_1.createPaymentValidationResult)({
            stage: models_1.PaymentValidationStage.REQUEST,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "PaymentRequestValidator",
            },
        });
    }
}
exports.PaymentRequestValidator = PaymentRequestValidator;
//# sourceMappingURL=payment-request-validator.js.map