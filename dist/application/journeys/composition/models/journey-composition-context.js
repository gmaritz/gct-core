"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJourneyCompositionContext = createJourneyCompositionContext;
const journeys_1 = require("@application/journeys");
const experiences_1 = require("../experiences");
function mapSource(source) {
    if (source === journeys_1.JourneyCompositionSource.HOMEPAGE
        || source === journeys_1.JourneyCompositionSource.PACKAGE_DESIGNER
        || source === journeys_1.JourneyCompositionSource.PACKAGE_DETAILS
        || source === journeys_1.JourneyCompositionSource.ADMIN
        || source === journeys_1.JourneyCompositionSource.API
        || source === journeys_1.JourneyCompositionSource.INTERNAL) {
        return source;
    }
    return journeys_1.JourneyCompositionSource.INTERNAL;
}
function mapJourneyType(type) {
    if (type === journeys_1.JourneyType.DAY_TOUR
        || type === journeys_1.JourneyType.MULTI_DAY
        || type === journeys_1.JourneyType.PACKAGE
        || type === journeys_1.JourneyType.PRIVATE) {
        return type;
    }
    return journeys_1.JourneyType.PACKAGE;
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
    const accommodationContext = Object.freeze({
        requestId: query.context?.requestId ?? "",
        source,
        timestamp: createdAt,
        destination,
        checkInDate: new Date(createdAt),
        checkOutDate: new Date(createdAt),
        adults: travellerRequirements?.minimumTravellers ?? 1,
        children: 0,
        rooms: 1,
        channel: "WEB",
        locale: "EN",
        market: "ZA",
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