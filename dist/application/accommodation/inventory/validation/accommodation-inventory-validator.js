"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationInventoryValidator = void 0;
const accommodation_inventory_validation_error_code_1 = require("./accommodation-inventory-validation-error-code");
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
class AccommodationInventoryValidator {
    validate(query) {
        const errors = [];
        if (isBlank(query.identifier)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.MISSING_IDENTIFIER, "identifier", "Identifier is required."));
        }
        const hasCheckIn = isValidDate(query.checkInDate);
        const hasCheckOut = isValidDate(query.checkOutDate);
        if (!hasCheckIn) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.MISSING_CHECK_IN, "checkInDate", "Check-in date is required."));
        }
        if (!hasCheckOut) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.MISSING_CHECK_OUT, "checkOutDate", "Check-out date is required."));
        }
        if (hasCheckIn && hasCheckOut && query.checkOutDate.getTime() <= query.checkInDate.getTime()) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.INVALID_DATE_RANGE, "checkOutDate", "Check-out date must be after check-in date."));
        }
        if (!isValidCount(query.adults, 1)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.INVALID_ADULT_COUNT, "adults", "Adults must be at least 1."));
        }
        if (!isValidCount(query.children, 0)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.INVALID_CHILD_COUNT, "children", "Children must be 0 or greater."));
        }
        if (!isValidCount(query.rooms, 1)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.INVALID_ROOM_COUNT, "rooms", "Rooms must be at least 1."));
        }
        if (isBlank(query.context.requestId)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.MISSING_REQUEST_ID, "context.requestId", "Request ID is required."));
        }
        if (isBlank(query.context.source)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.MISSING_SOURCE, "context.source", "Source is required."));
        }
        if (!isValidDate(query.context.timestamp)) {
            errors.push(createError(accommodation_inventory_validation_error_code_1.AccommodationInventoryValidationErrorCode.MISSING_TIMESTAMP, "context.timestamp", "Timestamp is required."));
        }
        return Object.freeze({
            valid: errors.length === 0,
            errors: Object.freeze(errors),
        });
    }
}
exports.AccommodationInventoryValidator = AccommodationInventoryValidator;
//# sourceMappingURL=accommodation-inventory-validator.js.map