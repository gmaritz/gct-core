"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPresentationMapper = void 0;
const journey_presentation_model_1 = require("../models/journey-presentation-model");
function createPlaceholderImage(label) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="journeyHero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8dfc9" />
          <stop offset="50%" stop-color="#b28746" />
          <stop offset="100%" stop-color="#5d3f1f" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#journeyHero)" />
      <circle cx="1040" cy="160" r="88" fill="rgba(255,255,255,0.18)" />
      <path d="M0 540 L210 430 L410 470 L650 330 L910 430 L1120 300 L1280 360 L1280 720 L0 720 Z" fill="rgba(255,255,255,0.14)" />
    </svg>
  `.trim();
    return Object.freeze({
        src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        alt: label,
        width: 1280,
        height: 720,
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
            heroImage: createPlaceholderImage(title),
            highlights: createHighlights(result),
            accommodationSummary: `${journey.accommodation.length} accommodation option${journey.accommodation.length === 1 ? "" : "s"}`,
            experienceSummary: `${journey.experiences.length} experience${journey.experiences.length === 1 ? "" : "s"}`,
            primaryPrice: undefined,
            badges: createBadges(result),
            callToAction: {
                label: "View Journey",
                href: `#journey-${journey.identity.id}`,
            },
        });
    }
}
exports.JourneyPresentationMapper = JourneyPresentationMapper;
//# sourceMappingURL=journey-presentation-mapper.js.map