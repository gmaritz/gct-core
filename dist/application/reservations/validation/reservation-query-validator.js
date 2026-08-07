"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationQueryValidator = void 0;
const models_1 = require("./models");
const models_2 = require("./models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}
function createError(code, message) {
    return Object.freeze({ code, message });
}
class ReservationQueryValidator {
    validate(query) {
        const errors = [];
        if (typeof query !== "object" || query === null) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_QUERY, "Reservation query is required."));
            return (0, models_2.createReservationValidationResult)({
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "ReservationQueryValidator",
                },
            });
        }
        if (isBlank(query.requestId) || isBlank(query.journeyId) || !Array.isArray(query.travellers) || query.travellers.length === 0) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_STRUCTURE, "Reservation query structure is invalid."));
        }
        if (!isValidDate(query.checkInDate) || !isValidDate(query.checkOutDate) || query.checkOutDate <= query.checkInDate) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_DATES, "Reservation dates are invalid."));
        }
        if (!Array.isArray(query.travellers) || query.travellers.some((traveller) => isBlank(traveller?.travellerId) || isBlank(traveller?.fullName))) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_TRAVELLER, "Traveller details are invalid."));
        }
        return (0, models_2.createReservationValidationResult)({
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "ReservationQueryValidator",
            },
        });
    }
}
exports.ReservationQueryValidator = ReservationQueryValidator;
//# sourceMappingURL=reservation-query-validator.js.map