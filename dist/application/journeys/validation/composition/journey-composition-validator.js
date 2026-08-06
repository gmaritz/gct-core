"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyCompositionValidator = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
const query_1 = require("../query");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isEnumValue(value, enumeration) {
    return typeof value === "string" && Object.values(enumeration).includes(value);
}
function createError(code, message) {
    return Object.freeze({ code, message });
}
function hasDestination(query) {
    const destinations = query.destinationRequirements?.destinations;
    if (!Array.isArray(destinations) || destinations.length === 0) {
        return false;
    }
    return destinations.every((destination) => !isBlank(destination?.name));
}
function isDurationCompatible(query) {
    const duration = query.stayRequirements?.duration;
    if (!duration || typeof duration.days !== "number" || typeof duration.nights !== "number") {
        return false;
    }
    if (!Number.isInteger(duration.days) || !Number.isInteger(duration.nights)) {
        return false;
    }
    if (query.journeyType === models_1.JourneyType.DAY_TOUR) {
        return duration.days === 1 && duration.nights === 0;
    }
    if (query.journeyType === models_1.JourneyType.MULTI_DAY || query.journeyType === models_1.JourneyType.PACKAGE) {
        return duration.days >= 2 && duration.nights >= 1;
    }
    return duration.days >= 1 && duration.nights >= 0;
}
class JourneyCompositionValidator {
    validate(query) {
        const errors = [];
        if (!isEnumValue(query.journeyType, models_1.JourneyType)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_JOURNEY_TYPE, "Journey type is unsupported for composition."));
        }
        if (!isEnumValue(query.strategy, query_1.JourneyCompositionStrategy)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_STRATEGY, "Composition strategy is unsupported."));
        }
        if (!hasDestination(query)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_DESTINATION, "At least one destination is required."));
        }
        if (!isDurationCompatible(query)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_DURATION, "Journey duration is incompatible with the selected journey type."));
        }
        return (0, models_2.createJourneyValidationResult)(errors);
    }
}
exports.JourneyCompositionValidator = JourneyCompositionValidator;
//# sourceMappingURL=journey-composition-validator.js.map