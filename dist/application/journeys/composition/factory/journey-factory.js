"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyFactory = void 0;
const journeys_1 = require("@application/journeys");
function mapCategory(journeyType) {
    switch (journeyType) {
        case journeys_1.JourneyType.DAY_TOUR:
            return journeys_1.JourneyCategory.CLASSIC;
        case journeys_1.JourneyType.MULTI_DAY:
            return journeys_1.JourneyCategory.ADVENTURE;
        case journeys_1.JourneyType.PRIVATE:
            return journeys_1.JourneyCategory.LUXURY;
        case journeys_1.JourneyType.PACKAGE:
        default:
            return journeys_1.JourneyCategory.SIGNATURE;
    }
}
function createDestinations(context) {
    const destinations = context.query.destinationRequirements?.destinations ?? [];
    return Object.freeze(destinations
        .filter((destination) => typeof destination?.name === "string" && destination.name.trim().length > 0)
        .map((destination) => Object.freeze({ name: destination.name.trim() })));
}
function createTags(context) {
    return Object.freeze(context.experienceContext.interests
        .filter((interest) => interest.trim().length > 0)
        .map((interest) => Object.freeze({ value: interest })));
}
function ensureInvariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
class JourneyFactory {
    create(input) {
        const { context } = input;
        const destinations = createDestinations(context);
        ensureInvariant(destinations.length > 0, "Journey factory requires at least one destination.");
        ensureInvariant(typeof context.query.context?.requestId === "string" && context.query.context.requestId.trim().length > 0, "Journey factory requires a request ID.");
        const journeyType = context.query.journeyType ?? journeys_1.JourneyType.PACKAGE;
        const duration = context.query.stayRequirements?.duration;
        const travellerRules = context.query.travellerRequirements;
        const composition = {
            identity: Object.freeze({
                id: `journey-${context.query.context.requestId}`,
            }),
            classification: Object.freeze({
                type: typeof journeyType === "string" ? journeyType : journeys_1.JourneyType.PACKAGE,
                category: mapCategory(journeyType),
            }),
            metadata: Object.freeze({
                created: new Date(context.createdAt),
                modified: new Date(context.createdAt),
                version: "1.0.0",
                source: "APP-003.7",
            }),
            status: journeys_1.JourneyStatus.DRAFT,
            lifecycle: journeys_1.JourneyLifecycle.DESIGN,
            duration: Object.freeze({
                days: duration?.days,
                nights: duration?.nights,
                description: duration?.description,
            }),
            destinations,
            accommodation: Object.freeze(input.accommodation.map((item) => Object.freeze({ ...item }))),
            experiences: Object.freeze(input.experiences.map((item) => Object.freeze({ ...item }))),
            travellerRules: Object.freeze({
                minimumTravellers: travellerRules?.minimumTravellers,
                maximumTravellers: travellerRules?.maximumTravellers,
                privateOnly: travellerRules?.privateOnly,
                ageRestriction: travellerRules?.ageRestriction,
            }),
            tags: createTags(context),
        };
        return journeys_1.Journey.create(composition);
    }
}
exports.JourneyFactory = JourneyFactory;
//# sourceMappingURL=journey-factory.js.map