"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyQueryValidator = exports.JourneyCompositionSource = exports.JourneyCompositionStrategy = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
const models_3 = require("../models");
var JourneyCompositionStrategy;
(function (JourneyCompositionStrategy) {
    JourneyCompositionStrategy["STANDARD"] = "STANDARD";
    JourneyCompositionStrategy["CURATED"] = "CURATED";
    JourneyCompositionStrategy["DYNAMIC"] = "DYNAMIC";
})(JourneyCompositionStrategy || (exports.JourneyCompositionStrategy = JourneyCompositionStrategy = {}));
var JourneyCompositionSource;
(function (JourneyCompositionSource) {
    JourneyCompositionSource["HOMEPAGE"] = "HOMEPAGE";
    JourneyCompositionSource["PACKAGE_DESIGNER"] = "PACKAGE_DESIGNER";
    JourneyCompositionSource["PACKAGE_DETAILS"] = "PACKAGE_DETAILS";
    JourneyCompositionSource["ADMIN"] = "ADMIN";
    JourneyCompositionSource["API"] = "API";
    JourneyCompositionSource["INTERNAL"] = "INTERNAL";
})(JourneyCompositionSource || (exports.JourneyCompositionSource = JourneyCompositionSource = {}));
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}
function isValidIntegerAtLeast(value, minimum) {
    return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}
function isEnumValue(value, enumeration) {
    return typeof value === "string" && Object.values(enumeration).includes(value);
}
function createError(code, message) {
    return Object.freeze({ code, message });
}
function isValidTravellerRequirements(requirements) {
    if (!isObject(requirements)) {
        return false;
    }
    const travellerRequirements = requirements;
    if (!isValidIntegerAtLeast(travellerRequirements.minimumTravellers, 1)) {
        return false;
    }
    if (!isValidIntegerAtLeast(travellerRequirements.maximumTravellers, travellerRequirements.minimumTravellers ?? 1)) {
        return false;
    }
    if (typeof travellerRequirements.privateOnly !== "undefined" && typeof travellerRequirements.privateOnly !== "boolean") {
        return false;
    }
    if (typeof travellerRequirements.ageRestriction !== "undefined" && isBlank(travellerRequirements.ageRestriction)) {
        return false;
    }
    return true;
}
function isValidDuration(duration) {
    if (!isObject(duration)) {
        return false;
    }
    const journeyDuration = duration;
    if (!isValidIntegerAtLeast(journeyDuration.days, 1)) {
        return false;
    }
    if (!isValidIntegerAtLeast(journeyDuration.nights, 0)) {
        return false;
    }
    if (typeof journeyDuration.description !== "undefined" && isBlank(journeyDuration.description)) {
        return false;
    }
    return journeyDuration.nights <= journeyDuration.days;
}
class JourneyQueryValidator {
    validate(query) {
        const errors = [];
        if (!isObject(query)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_QUERY, "Journey request is required."));
            return (0, models_3.createJourneyValidationResult)(errors);
        }
        const request = query;
        if (!isObject(request.context) || isBlank(request.context.requestId) || !isEnumValue(request.context.source, JourneyCompositionSource) || !isValidDate(request.context.timestamp)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.MISSING_CONTEXT, "Journey context is required."));
        }
        if (!isEnumValue(request.journeyType, models_1.JourneyType)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_JOURNEY_TYPE, "Journey type is invalid."));
        }
        if (!isEnumValue(request.strategy, JourneyCompositionStrategy)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_STRATEGY, "Composition strategy is invalid."));
        }
        if (!isValidTravellerRequirements(request.travellerRequirements)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_TRAVELLER_RULES, "Traveller requirements are invalid."));
        }
        if (!isValidDuration(request.stayRequirements?.duration)) {
            errors.push(createError(models_2.JourneyValidationErrorCode.INVALID_DURATION, "Stay requirements are invalid."));
        }
        return (0, models_3.createJourneyValidationResult)(errors);
    }
}
exports.JourneyQueryValidator = JourneyQueryValidator;
//# sourceMappingURL=journey-query-validator.js.map