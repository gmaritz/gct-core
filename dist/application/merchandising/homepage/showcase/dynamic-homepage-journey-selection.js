"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDynamicHomepageJourneySelector = void 0;
const dynamic_homepage_journey_resolver_1 = require("./dynamic-homepage-journey-resolver");
function toSelectionResult(journeyId, resolution) {
    if (resolution.status !== "RESOLVED" || !resolution.journey) {
        return {
            status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status,
            journeyId,
        };
    }
    return {
        status: "SELECTED",
        journeyId,
        title: `${resolution.journey.classification.category} ${resolution.journey.destinations[0]?.name ?? "Journey"} Journey`,
        continuationHref: `/ui/journeys/${journeyId}/selected`,
    };
}
class DefaultDynamicHomepageJourneySelector {
    constructor(resolver = new dynamic_homepage_journey_resolver_1.DefaultDynamicHomepageJourneyResolver()) {
        this.resolver = resolver;
    }
    async selectJourney(journeyId) {
        return toSelectionResult(journeyId, await this.resolver.resolve(journeyId));
    }
}
exports.DefaultDynamicHomepageJourneySelector = DefaultDynamicHomepageJourneySelector;
//# sourceMappingURL=dynamic-homepage-journey-selection.js.map