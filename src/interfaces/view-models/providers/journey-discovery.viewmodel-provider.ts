import { Journey } from "../../../application/journeys";
import { JourneyDiscoveryViewModel } from "../journeys/journey-discovery.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";

function createPlaceholderImage(label: string): ImageViewModel {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#b28746"/><text x="64" y="650" fill="white" font-size="48">${label}</text></svg>`;
  return {
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    alt: label,
    width: 1280,
    height: 720,
  };
}

export class JourneyDiscoveryViewModelProvider {
  public provide(journey: Journey): JourneyDiscoveryViewModel {
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
