"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationContentValidator = void 0;
const models_1 = require("../models");
const accommodation_content_validation_error_code_1 = require("./accommodation-content-validation-error-code");
const CONTENT_LOCALES = new Set(Object.values(models_1.AccommodationContentLocale));
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isValidTimestamp(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}
function isValidLocale(value) {
    return typeof value === "string" && CONTENT_LOCALES.has(value);
}
function createError(code, field, message) {
    return Object.freeze({ code, field, message });
}
class AccommodationContentValidator {
    validate(query) {
        const errors = [];
        const { identifier, context } = query;
        if (identifier === undefined || identifier === null || identifier === "") {
            errors.push(createError(accommodation_content_validation_error_code_1.AccommodationContentValidationErrorCode.MISSING_IDENTIFIER, "identifier", "Identifier is required."));
        }
        else if (typeof identifier !== "string" || identifier.trim().length === 0) {
            errors.push(createError(accommodation_content_validation_error_code_1.AccommodationContentValidationErrorCode.INVALID_IDENTIFIER, "identifier", "Identifier is invalid."));
        }
        if (isBlank(context.requestId)) {
            errors.push(createError(accommodation_content_validation_error_code_1.AccommodationContentValidationErrorCode.MISSING_REQUEST_ID, "context.requestId", "Request ID is required."));
        }
        if (isBlank(context.source)) {
            errors.push(createError(accommodation_content_validation_error_code_1.AccommodationContentValidationErrorCode.MISSING_SOURCE, "context.source", "Source is required."));
        }
        if (!isValidTimestamp(context.timestamp)) {
            errors.push(createError(accommodation_content_validation_error_code_1.AccommodationContentValidationErrorCode.MISSING_TIMESTAMP, "context.timestamp", "Timestamp is required."));
        }
        if (!isValidLocale(context.locale)) {
            errors.push(createError(accommodation_content_validation_error_code_1.AccommodationContentValidationErrorCode.INVALID_LOCALE, "context.locale", "Locale is invalid."));
        }
        return Object.freeze({
            valid: errors.length === 0,
            errors: Object.freeze(errors),
        });
    }
}
exports.AccommodationContentValidator = AccommodationContentValidator;
//# sourceMappingURL=accommodation-content-validator.js.map