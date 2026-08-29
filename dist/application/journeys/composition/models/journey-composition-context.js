"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJourneyCompositionContext = createJourneyCompositionContext;
const models_1 = require("../../models");
const validation_1 = require("../../validation");
const experiences_1 = require("../experiences");
function mapSource(source) {
    if (source === validation_1.JourneyCompositionSource.HOMEPAGE
        || source === validation_1.JourneyCompositionSource.PACKAGE_DESIGNER
        || source === validation_1.JourneyCompositionSource.PACKAGE_DETAILS
        || source === validation_1.JourneyCompositionSource.ADMIN
        || source === validation_1.JourneyCompositionSource.API
        || source === validation_1.JourneyCompositionSource.INTERNAL) {
        return source;
    }
    return validation_1.JourneyCompositionSource.INTERNAL;
}
function mapJourneyType(type) {
    if (type === models_1.JourneyType.DAY_TOUR
        || type === models_1.JourneyType.MULTI_DAY
        || type === models_1.JourneyType.PACKAGE
        || type === models_1.JourneyType.PRIVATE) {
        return type;
    }
    return models_1.JourneyType.PACKAGE;
}
function firstDestination(query) {
    return query.destinationRequirements?.destinations?.[0]?.name ?? "";
}
function createJourneyCompositionContext(query, aggregate) {
    const createdAt = new Date(query.context?.timestamp ?? new Date());
    const source = mapSource(query.context?.source);
    const journeyType = mapJourneyType(query.journeyType);
    const destination = firstDestination(query);
    const travellerRequirements = query.travellerRequirements;
    const duration = query.stayRequirements?.duration;
    const checkInDate = new Date(createdAt);
    const checkOutDate = new Date(createdAt);
    checkOutDate.setUTCDate(checkOutDate.getUTCDate() + (duration?.nights ?? 1));
    const accommodationContext = Object.freeze({
        requestId: query.context?.requestId ?? "",
        source,
        timestamp: createdAt,
        destination,
        checkInDate,
        checkOutDate,
        adults: travellerRequirements?.minimumTravellers ?? 1,
        children: 0,
        rooms: 1,
        channel: "WEB",
        locale: "EN",
        market: "ZA",
        packageStop: {
            packageId: query.context?.requestId ?? "",
            stopId: `${query.context?.requestId ?? ""}-stop-1`,
            stopOrder: 1,
            checkInDate,
            checkOutDate,
        },
    });
    const experienceContext = (0, experiences_1.createExperienceCompositionContext)({
        destination,
        journeyType,
        travellerProfile: {
            adults: travellerRequirements?.minimumTravellers ?? 1,
            children: 0,
            privateOnly: travellerRequirements?.privateOnly,
        },
        interests: Object.freeze([]),
        duration: {
            days: duration?.days,
            nights: duration?.nights,
            description: duration?.description,
        },
        requestedAt: createdAt,
    });
    return Object.freeze({
        query,
        policyContext: Object.freeze({ query, aggregate }),
        accommodationContext,
        experienceContext,
        createdAt,
    });
}
//# sourceMappingURL=journey-composition-context.js.map