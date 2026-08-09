"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationValidator = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
const reservationReadyStatuses = new Set(["CONFIRMED", "AMENDED"]);
class ReservationValidator {
    validate(request) {
        const errors = [];
        if (request.reservationContext?.exists === false) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.RESERVATION,
                code: models_1.InvoiceValidationErrorCode.MISSING_RESERVATION,
                message: "Reservation is required.",
                severity: "CRITICAL",
            }));
        }
        if (request.reservationContext?.status === "CANCELLED") {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.RESERVATION,
                code: models_1.InvoiceValidationErrorCode.RESERVATION_CANCELLED,
                message: "Reservation is cancelled and not valid for invoice processing.",
                severity: "CRITICAL",
            }));
        }
        if (request.reservationContext?.exists === true
            && !isBlank(request.reservationContext.status)
            && !reservationReadyStatuses.has(request.reservationContext.status.trim())
            && request.reservationContext.status !== "CANCELLED") {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.RESERVATION,
                code: models_1.InvoiceValidationErrorCode.RESERVATION_NOT_CONFIRMED,
                message: "Reservation is not in a confirmed state for invoice processing.",
                severity: "CRITICAL",
            }));
        }
        const reservationId = request.reservationReference?.reservationId ?? request.invoice?.reservationReference.reservationId;
        const contextReservationId = request.reservationContext?.reservationId;
        if (!isBlank(reservationId) && !isBlank(contextReservationId) && reservationId !== contextReservationId) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.RESERVATION,
                code: models_1.InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE,
                message: "Invoice reservation reference is inconsistent with reservation context.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_1.createInvoiceValidationResult)({
            stage: models_1.InvoiceValidationStage.RESERVATION,
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