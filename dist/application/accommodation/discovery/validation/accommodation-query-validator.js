"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationQueryValidator = void 0;
const accommodation_validation_error_code_1 = require("./accommodation-validation-error-code");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}
function isValidCount(value, minimum) {
    return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}
function createError(code, field, message) {
    return Object.freeze({ code, field, message });
}
class AccommodationQueryValidator {
    validate(query) {
        const errors = [];
        const { criteria, context } = query;
        if (isBlank(criteria.destination)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.MISSING_DESTINATION, "criteria.destination", "Destination is required."));
        }
        const hasCheckIn = isValidDate(criteria.checkInDate);
        const hasCheckOut = isValidDate(criteria.checkOutDate);
        if (!hasCheckIn) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.MISSING_CHECK_IN, "criteria.checkInDate", "Check-in date is required."));
        }
        if (!hasCheckOut) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.MISSING_CHECK_OUT, "criteria.checkOutDate", "Check-out date is required."));
        }
        if (hasCheckIn && hasCheckOut && criteria.checkOutDate.getTime() <= criteria.checkInDate.getTime()) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.INVALID_DATE_RANGE, "criteria.checkOutDate", "Check-out date must be after check-in date."));
        }
        if (!isValidCount(criteria.adults, 1)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.INVALID_ADULT_COUNT, "criteria.adults", "Adults must be at least 1."));
        }
        if (!isValidCount(criteria.children, 0)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.INVALID_CHILD_COUNT, "criteria.children", "Children must be 0 or greater."));
        }
        if (!isValidCount(criteria.rooms, 1)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.INVALID_ROOM_COUNT, "criteria.rooms", "Rooms must be at least 1."));
        }
        if (isBlank(context.requestId)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.MISSING_REQUEST_ID, "context.requestId", "Request ID is required."));
        }
        if (isBlank(context.source)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.MISSING_SOURCE, "context.source", "Source is required."));
        }
        if (!isValidDate(context.timestamp)) {
            errors.push(createError(accommodation_validation_error_code_1.AccommodationValidationErrorCode.MISSING_TIMESTAMP, "context.timestamp", "Timestamp is required."));
        }
        return Object.freeze({
            valid: errors.length === 0,
            errors: Object.freeze(errors),
        });
    }
}
exports.AccommodationQueryValidator = AccommodationQueryValidator;
//# sourceMappingURL=accommodation-query-validator.js.map