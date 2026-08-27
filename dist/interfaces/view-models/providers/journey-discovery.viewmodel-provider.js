"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyDiscoveryViewModelProvider = void 0;
function createPlaceholderImage(label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#b28746"/><text x="64" y="650" fill="white" font-size="48">${label}</text></svg>`;
    return {
        src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        alt: label,
        width: 1280,
        height: 720,
    };
}
class JourneyDiscoveryViewModelProvider {
    provide(journey) {
        const destination = journey.destinations.map((item) => item.name).join(" + ");
        const title = `${journey.classification.category} ${destination} Journey`;
        const duration = journey.duration.description || `${journey.duration.days} Days / ${journey.duration.nights} Nights`;
        const highlights = [
            ...journey.experiences.map((experience) => experience.name),
            ...journey.accommodation.map((accommodation) => accommodation.name),
        ].filter((value, index, values) => value.trim().length > 0 && values.indexOf(value) === index).slice(0, 3);
        return Object.freeze({
            id: journey.identity.id,
            title,
            destination,
            duration,
            highlights: Object.freeze(highlights),
            image: Object.freeze(createPlaceholderImage(title)),
            price: undefined,
            continuation: Object.freeze({
                label: "Continue exploring",
                href: "/ui/placeholder#journey-planning",
                style: "primary",
            }),
        });
    }
}
exports.JourneyDiscoveryViewModelProvider = JourneyDiscoveryViewModelProvider;
//# sourceMappingURL=journey-discovery.viewmodel-provider.js.map