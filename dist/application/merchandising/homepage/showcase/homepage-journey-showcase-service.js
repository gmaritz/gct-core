"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageJourneyShowcaseService = void 0;
exports.createDefaultHomepageJourneyShowcaseService = createDefaultHomepageJourneyShowcaseService;
const journeys_1 = require("../../../journeys");
const policies_1 = require("../../../journeys/policies");
const accommodation_1 = require("../../../accommodation");
const homepage_journey_showcase_result_1 = require("./homepage-journey-showcase-result");
const FEATURED_JOURNEYS = Object.freeze([
    Object.freeze({
        requestId: "homepage-journey-001",
        destination: "Cape Winelands",
        journeyType: journeys_1.JourneyType.PACKAGE,
        days: 4,
        nights: 3,
    }),
    Object.freeze({
        requestId: "homepage-journey-002",
        destination: "Atlantic Seaboard",
        journeyType: journeys_1.JourneyType.PACKAGE,
        days: 3,
        nights: 2,
    }),
    Object.freeze({
        requestId: "homepage-journey-003",
        destination: "Franschhoek Valley",
        journeyType: journeys_1.JourneyType.PRIVATE,
        days: 5,
        nights: 4,
    }),
]);
function isFulfilled(result) {
    return result.status === "fulfilled";
}
function createQueries(timestamp) {
    return Object.freeze(FEATURED_JOURNEYS.map((feature) => Object.freeze({
        journeyType: feature.journeyType,
        strategy: journeys_1.JourneyCompositionStrategy.CURATED,
        context: Object.freeze({
            requestId: feature.requestId,
            source: journeys_1.JourneyCompositionSource.HOMEPAGE,
            timestamp: new Date(timestamp),
        }),
        travellerRequirements: Object.freeze({
            minimumTravellers: 2,
            maximumTravellers: 6,
            privateOnly: true,
        }),
        destinationRequirements: Object.freeze({
            destinations: Object.freeze([
                Object.freeze({ name: feature.destination }),
            ]),
        }),
        stayRequirements: Object.freeze({
            duration: Object.freeze({
                days: feature.days,
                nights: feature.nights,
                description: `${feature.days} Days / ${feature.nights} Nights`,
            }),
        }),
    })));
}
function createAccommodation(destination) {
    return {
        identity: {
            id: destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            name: `${destination} Retreat`,
        },
        category: "Boutique Hotel",
        location: {
            country: "South Africa",
            region: "Western Cape",
            city: destination,
            suburb: "Central",
            latitude: -33.9,
            longitude: 18.4,
        },
        rating: {
            stars: 5,
            classification: "Luxury",
            reviewScore: 4.8,
        },
        images: [],
        amenities: ["Wi-Fi", "Breakfast Included"],
        policies: [],
        contacts: [],
        providerReference: {
            provider: "curated",
            providerAccommodationId: destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
    };
}
function createSearchResult(destination) {
    return {
        accommodations: Object.freeze([createAccommodation(destination)]),
        metadata: Object.freeze({
            generatedAt: new Date(),
            version: "1.0.0",
            provider: "curated",
        }),
    };
}
function createContentResult(destination) {
    return {
        accommodation: createAccommodation(destination),
        metadata: Object.freeze({
            generatedAt: new Date(),
            version: "1.0.0",
            provider: "curated",
        }),
    };
}
function createAvailabilityResult(destination) {
    return {
        kind: "ACCOMMODATION",
        accommodation: createAccommodation(destination),
        available: true,
        metadata: Object.freeze({
            generatedAt: new Date(),
            version: "1.0.0",
            provider: "curated",
        }),
    };
}
function createRateResult(destination) {
    const accommodationId = destination.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
        accommodationId,
        stayPeriod: Object.freeze({
            checkIn: new Date("2026-12-01T00:00:00.000Z"),
            checkOut: new Date("2026-12-05T00:00:00.000Z"),
        }),
        occupancy: Object.freeze({
            adults: 2,
            children: 0,
            rooms: 1,
        }),
        selectionStrategy: accommodation_1.AccommodationRateSelectionStrategy.RECOMMENDED,
        rates: Object.freeze([
            Object.freeze({
                id: `${accommodationId}-rate-1`,
                type: accommodation_1.AccommodationRateType.PUBLIC,
                status: accommodation_1.AccommodationRateStatus.AVAILABLE,
                currency: accommodation_1.AccommodationCurrency.ZAR,
                amount: 18950,
            }),
        ]),
        metadata: Object.freeze({
            generatedAt: new Date(),
            version: "1.0.0",
            provider: "curated",
        }),
    };
}
function createExperienceCandidateProvider() {
    return {
        resolve: (context) => Object.freeze([
            Object.freeze({
                experienceId: `${context.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-exp-1`,
                name: `${context.destination} Signature Experience`,
                source: journeys_1.ExperienceSource.CURATED,
                type: journeys_1.ExperienceType.SCENIC,
                priority: journeys_1.ExperiencePriority.PRIMARY,
                sequence: Object.freeze({ day: 1, order: 1 }),
            }),
            Object.freeze({
                experienceId: `${context.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-exp-2`,
                name: `${context.destination} Private Tasting`,
                source: journeys_1.ExperienceSource.CURATED,
                type: journeys_1.ExperienceType.WINE,
                priority: journeys_1.ExperiencePriority.SECONDARY,
                sequence: Object.freeze({ day: 2, order: 1 }),
            }),
        ]),
    };
}
function createDefaultJourneyCompositionService() {
    const validationPipeline = new journeys_1.JourneyValidationPipeline();
    const policyPipeline = new policies_1.JourneyPolicyPipeline();
    const accommodationCompositionAdapter = new journeys_1.AccommodationCompositionAdapter({
        search: async (query) => createSearchResult(query.criteria.destination),
    }, {
        execute: async (query) => createContentResult(query.context.requestId.includes("002") ? "Atlantic Seaboard" : query.context.requestId.includes("003") ? "Franschhoek Valley" : "Cape Winelands"),
    }, {
        execute: async (query) => createAvailabilityResult(query.context.requestId.includes("002") ? "Atlantic Seaboard" : query.context.requestId.includes("003") ? "Franschhoek Valley" : "Cape Winelands"),
    }, {
        execute: async (query) => createRateResult(query.identifier.includes("atlantic") ? "Atlantic Seaboard" : query.identifier.includes("franschhoek") ? "Franschhoek Valley" : "Cape Winelands"),
    });
    const experienceFramework = new journeys_1.ExperienceCompositionFramework(createExperienceCandidateProvider());
    const journeyFactory = new journeys_1.JourneyFactory();
    return new journeys_1.JourneyCompositionService(validationPipeline, policyPipeline, accommodationCompositionAdapter, experienceFramework, journeyFactory);
}
class HomepageJourneyShowcaseService {
    constructor(journeyCompositionService, presentationMapper, viewModelProvider) {
        this.journeyCompositionService = journeyCompositionService;
        this.presentationMapper = presentationMapper;
        this.viewModelProvider = viewModelProvider;
    }
    async execute() {
        const queries = createQueries(new Date());
        const compositionExecutions = await Promise.allSettled(queries.map((query) => this.journeyCompositionService.execute(query)));
        const featuredJourneys = compositionExecutions
            .filter(isFulfilled)
            .map((execution) => this.presentationMapper.map(execution.value))
            .filter((model) => model !== null)
            .map((model) => this.viewModelProvider.provideHomepageJourney(model));
        return (0, homepage_journey_showcase_result_1.createHomepageJourneyShowcaseResult)({
            success: featuredJourneys.length > 0,
            featuredJourneys: Object.freeze(featuredJourneys),
            metadata: Object.freeze({
                generatedAt: new Date(),
                version: "1.0.0",
            }),
        });
    }
}
exports.HomepageJourneyShowcaseService = HomepageJourneyShowcaseService;
function createDefaultHomepageJourneyShowcaseService() {
    return new HomepageJourneyShowcaseService(createDefaultJourneyCompositionService(), new journeys_1.JourneyPresentationMapper(), new journeys_1.JourneyViewModelProvider());
}
//# sourceMappingURL=homepage-journey-showcase-service.js.map