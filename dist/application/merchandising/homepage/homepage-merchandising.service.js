"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHomepageMerchandisingService = void 0;
const policies_1 = require("../policies");
const PLACEHOLDER_GENERATED_AT = new Date("2026-08-05T00:00:00.000Z");
const PLACEHOLDER_RESULT = {
    editorial: {
        eyebrow: "Curated Private Journeys",
        heading: "Discover South Africa Through Carefully Curated Journeys.",
        narrative: "From the vineyards of Stellenbosch to the coastline of the Garden Route, every Go Cape Tours journey combines exceptional accommodation, authentic experiences and local expertise to create unforgettable memories.",
        primaryCallToActionLabel: "Explore Experiences",
        primaryCallToActionHref: "#featured-experiences",
        secondaryCallToActionLabel: "Plan Your Journey",
        secondaryCallToActionHref: "#journey-planning",
    },
    journeys: [
        {
            id: "luxury-winelands-escape",
            title: "Luxury Winelands Escape",
            destination: "Cape Winelands",
            duration: "4 Days / 3 Nights",
            imageLabel: "Luxury Winelands landscape",
            highlights: [
                "Private cellar experiences",
                "Boutique lodges",
                "Curated culinary route",
            ],
            priceDisplay: "From R18 950 per couple",
            savingDisplay: "Save 22%",
            primaryCallToActionLabel: "View Journey",
            primaryCallToActionHref: "#journey-planning",
            isPrimary: true,
        },
        {
            id: "ocean-vineyard-retreat",
            title: "Ocean & Vineyard Retreat",
            destination: "Atlantic Seaboard",
            duration: "3 Days / 2 Nights",
            imageLabel: "Coastal journey landscape",
            highlights: ["Coastal estates", "Sunset tastings", "Private guide"],
            priceDisplay: "From R12 400 per couple",
            savingDisplay: "Save 18%",
            primaryCallToActionLabel: "View Journey",
            primaryCallToActionHref: "#journey-planning",
            isPrimary: false,
        },
        {
            id: "mountain-valley-signature",
            title: "Mountain Valley Signature",
            destination: "Franschhoek Valley",
            duration: "5 Days / 4 Nights",
            imageLabel: "Mountain and valley journey landscape",
            highlights: ["Scenic rail moments", "Chef tables", "Private transfers"],
            priceDisplay: "From R21 300 per couple",
            savingDisplay: "Save 15%",
            primaryCallToActionLabel: "View Journey",
            primaryCallToActionHref: "#journey-planning",
            isPrimary: false,
        },
    ],
    metadata: {
        generatedAt: PLACEHOLDER_GENERATED_AT,
        version: "1.0.0",
        source: "placeholder",
    },
};
class DefaultHomepageMerchandisingService {
    constructor(policies = (0, policies_1.createPlaceholderHomepageMerchandisingPolicies)()) {
        this.policies = policies;
    }
    async getHomepageMerchandising() {
        return {
            editorial: { ...PLACEHOLDER_RESULT.editorial },
            journeys: PLACEHOLDER_RESULT.journeys.map((journey) => ({
                ...journey,
                highlights: [...journey.highlights],
            })),
            metadata: {
                ...PLACEHOLDER_RESULT.metadata,
                generatedAt: new Date(PLACEHOLDER_RESULT.metadata.generatedAt),
            },
        };
    }
}
exports.DefaultHomepageMerchandisingService = DefaultHomepageMerchandisingService;
//# sourceMappingURL=homepage-merchandising.service.js.map