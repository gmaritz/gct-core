"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDynamicHomepageJourneyResolver = void 0;
const homepage_journey_showcase_service_1 = require("./homepage-journey-showcase-service");
class DefaultDynamicHomepageJourneyResolver {
    constructor(compositionService = (0, homepage_journey_showcase_service_1.createDefaultJourneyCompositionService)()) {
        this.compositionService = compositionService;
    }
    async resolve(publicJourneyId) {
        if (typeof publicJourneyId !== "string" || !/^journey-homepage-journey-\d{3}$/.test(publicJourneyId)) {
            return { status: "INVALID" };
        }
        const feature = homepage_journey_showcase_service_1.FEATURED_JOURNEYS.find((candidate) => `journey-${candidate.requestId}` === publicJourneyId);
        if (!feature) {
            return { status: "NOT_FOUND" };
        }
        const result = await this.compositionService.execute((0, homepage_journey_showcase_service_1.createHomepageJourneyQuery)(feature));
        if (!result.success || !result.payload) {
            return { status: "UNAVAILABLE" };
        }
        return { status: "RESOLVED", journey: result.payload };
    }
}
exports.DefaultDynamicHomepageJourneyResolver = DefaultDynamicHomepageJourneyResolver;
//# sourceMappingURL=dynamic-homepage-journey-resolver.js.map