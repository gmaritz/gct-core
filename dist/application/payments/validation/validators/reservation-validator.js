"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationValidator = void 0;
const models_1 = require("../models");
class ReservationValidator {
    validate(request) {
        const errors = [];
        if (!request.reservationContext?.exists) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.RESERVATION,
                code: models_1.PaymentValidationErrorCode.MISSING_RESERVATION,
                message: "Reservation is required.",
                severity: "CRITICAL",
            }));
        }
        if (request.reservationContext?.status === "CANCELLED") {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.RESERVATION,
                code: models_1.PaymentValidationErrorCode.RESERVATION_CANCELLED,
                message: "Reservation is cancelled and cannot be paid.",
                severity: "CRITICAL",
            }));
        }
        if (request.reservationContext?.payable === false) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.RESERVATION,
                code: models_1.PaymentValidationErrorCode.RESERVATION_NOT_PAYABLE,
                message: "Reservation is not payable.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_1.createPaymentValidationResult)({
            stage: models_1.PaymentValidationStage.RESERVATION,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "ReservationValidator",
            },
        });
    }
}
exports.ReservationValidator = ReservationValidator;
//# sourceMappingURL=reservation-validator.js.map