"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPresentationMapper = void 0;
const journey_presentation_model_1 = require("../models/journey-presentation-model");
function createJourneyHeroImage(destination, title) {
    const destLower = destination.toLowerCase();
    let src = "/images/hero/hero-cape-town-1600x900.webp";
    if (destLower.includes("winelands")) {
        src = "/images/journeys/cape-winelands-1600x900.webp";
    }
    else if (destLower.includes("atlantic") || destLower.includes("seaboard")) {
        src = "/images/journeys/atlantic-seaboard-1600x900.webp";
    }
    else if (destLower.includes("franschhoek") || destLower.includes("valley")) {
        src = "/images/journeys/franschhoek-valley-1600x900.webp";
    }
    return Object.freeze({
        src,
        alt: `${title} - ${destination} GCT Core Journey`,
        width: 1600,
        height: 900,
    });
}
function formatDestination(destinations) {
    if (destinations.length === 0) {
        return "South Africa";
    }
    if (destinations.length === 1) {
        return destinations[0].name;
    }
    return `${destinations[0].name} +${destinations.length - 1} more`;
}
function formatDuration(days, nights, description) {
    if (typeof description === "string" && description.trim().length > 0) {
        return description;
    }
    if (typeof days === "number" && typeof nights === "number") {
        return `${days} Days / ${nights} Nights`;
    }
    return "Custom Duration";
}
function createHighlights(result) {
    const journey = result.payload;
    if (!journey) {
        return Object.freeze([]);
    }
    const experienceHighlights = journey.experiences.map((experience) => experience.name);
    const accommodationHighlights = journey.accommodation.map((accommodation) => accommodation.name);
    const tagHighlights = journey.tags.map((tag) => tag.value);
    return Object.freeze([...experienceHighlights, ...accommodationHighlights, ...tagHighlights].filter((value, index, collection) => value.trim().length > 0 && collection.indexOf(value) === index).slice(0, 3));
}
function createBadges(result) {
    const journey = result.payload;
    if (!journey) {
        return Object.freeze([]);
    }
    return Object.freeze([
        journey.classification.category,
        journey.status,
    ]);
}
class JourneyPresentationMapper {
    map(result) {
        const journey = result.payload;
        if (!result.success || !journey) {
            return null;
        }
        const destination = formatDestination(journey.destinations);
        const duration = formatDuration(journey.duration.days, journey.duration.nights, journey.duration.description);
        const title = `${journey.classification.category} ${destination} Journey`;
        const subtitle = `${journey.classification.type} experience for curated travel`;
        return (0, journey_presentation_model_1.createJourneyPresentationModel)({
            identity: journey.identity.id,
            title,
            subtitle,
            destination,
            duration,
            heroImage: createJourneyHeroImage(destination, title),
            highlights: createHighlights(result),
            accommodationSummary: `${journey.accommodation.length} accommodation option${journey.accommodation.length === 1 ? "" : "s"}`,
            experienceSummary: `${journey.experiences.length} experience${journey.experiences.length === 1 ? "" : "s"}`,
            primaryPrice: undefined,
            badges: createBadges(result),
            callToAction: {
                label: "View Journey",
                href: `/ui/journeys/${journey.identity.id}`,
            },
        });
    }
}
exports.JourneyPresentationMapper = JourneyPresentationMapper;
//# sourceMappingURL=journey-presentation-mapper.js.map