"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyAggregateValidator = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function isValidIntegerAtLeast(value, minimum) {
    return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}
function createError(code, message) {
    return Object.freeze({ code, message });
}
function isValidClassification(classification) {
    return isObject(classification) && !isBlank(classification.type) && !isBlank(classification.category);
}
function isValidDuration(duration) {
    if (!isObject(duration)) {
        return false;
    }
    const journeyDuration = duration;
    return (isValidIntegerAtLeast(journeyDuration.days, 1) &&
        isValidIntegerAtLeast(journeyDuration.nights, 0) &&
        typeof journeyDuration.description === "string" &&
        !isBlank(journeyDuration.description) &&
        journeyDuration.nights <= journeyDuration.days);
}
function isValidDestinations(destinations) {
    return Array.isArray(destinations) && destinations.length > 0 && destinations.every((destination) => !isBlank(destination?.name));
}
function isValidTravellerRules(rules) {
    if (!isObject(rules)) {
        return false;
    }
    const travellerRules = rules;
    return (isValidIntegerAtLeast(travellerRules.minimumTravellers, 1) &&
        isValidIntegerAtLeast(travellerRules.maximumTravellers, travellerRules.minimumTravellers ?? 1) &&
        (typeof travellerRules.privateOnly === "undefined" || typeof travellerRules.privateOnly === "boolean") &&
        (typeof travellerRules.ageRestriction === "undefined" || !isBlank(travellerRules.ageRestriction)));
}
class JourneyAggregateValidator {
    validate(aggregate) {
        const errors = [];
        if (!isObject(aggregate)) {
            errors.push(createError(models_1.JourneyValidationErrorCode.INVALID_AGGREGATE, "Journey aggregate is required."));
            return (0, models_1.createJourneyValidationResult)(errors);
        }
        if (!aggregate.identity || isBlank(aggregate.identity.id)) {
            errors.push(createError(models_1.JourneyValidationErrorCode.MISSING_IDENTITY, "Journey identity is required."));
        }
        if (!isValidClassification(aggregate.classification)) {
            errors.push(createError(models_1.JourneyValidationErrorCode.INVALID_CLASSIFICATION, "Journey classification is invalid."));
        }
        if (!isValidDuration(aggregate.duration)) {
            errors.push(createError(models_1.JourneyValidationErrorCode.INVALID_DURATION, "Journey duration is invalid."));
        }
        if (!isValidDestinations(aggregate.destinations)) {
            errors.push(createError(models_1.JourneyValidationErrorCode.INVALID_DESTINATION, "Journey destinations are required."));
        }
        if (!isValidTravellerRules(aggregate.travellerRules)) {
            errors.push(createError(models_1.JourneyValidationErrorCode.INVALID_TRAVELLER_RULES, "Journey traveller rules are invalid."));
        }
        if (typeof aggregate.status !== "string" || typeof aggregate.lifecycle !== "string") {
            errors.push(createError(models_1.JourneyValidationErrorCode.INVALID_AGGREGATE, "Journey aggregate state is internally inconsistent."));
        }
        return (0, models_1.createJourneyValidationResult)(errors);
    }
}
exports.JourneyAggregateValidator = JourneyAggregateValidator;
//# sourceMappingURL=journey-aggregate-validator.js.map