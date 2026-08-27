"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyDetailViewModelProvider = void 0;
function createPlaceholderImage(label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#b28746"/><text x="64" y="650" fill="white" font-size="48">${label}</text></svg>`;
    return {
        src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        alt: label,
        width: 1280,
        height: 720,
    };
}
class JourneyDetailViewModelProvider {
    provide(journey) {
        const destination = journey.destinations.map((item) => item.name).join(" + ");
        const title = `${journey.classification.category} ${destination} Journey`;
        const duration = journey.duration.description || `${journey.duration.days} Days / ${journey.duration.nights} Nights`;
        return Object.freeze({
            id: journey.identity.id,
            title,
            subtitle: `${journey.classification.type} experience for curated travel`,
            destination,
            duration,
            summary: undefined,
            image: Object.freeze(createPlaceholderImage(title)),
            itinerary: Object.freeze([]),
            accommodation: Object.freeze(journey.accommodation.map((stay) => Object.freeze({
                id: stay.accommodationId,
                name: stay.name,
                destination,
                category: stay.accommodation?.category,
                rating: stay.accommodation?.rating.stars,
                nights: stay.packageStop ? Math.max(0, Math.round((stay.packageStop.checkOutDate.getTime() - stay.packageStop.checkInDate.getTime()) / 86400000)) : undefined,
            }))),
            experiences: Object.freeze(journey.experiences.map((experience) => Object.freeze({
                id: experience.experienceId,
                name: experience.name,
            }))),
            price: undefined,
            primaryCTA: Object.freeze({ label: "Continue planning", href: "#journey-planning", style: "primary" }),
        });
    }
}
exports.JourneyDetailViewModelProvider = JourneyDetailViewModelProvider;
//# sourceMappingURL=journey-detail.viewmodel-provider.js.map