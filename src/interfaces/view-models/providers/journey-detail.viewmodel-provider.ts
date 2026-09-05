import { Journey } from "../../../application/journeys";
import { JourneyDetailViewModel } from "../journeys/journey-detail.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";

function createJourneyHeroImage(title: string, destination: string): ImageViewModel {
  const destLower = destination.toLowerCase();
  let src = "/images/hero/hero-cape-town-1600x900.webp";
  if (destLower.includes("winelands")) {
    src = "/images/journeys/cape-winelands-1600x900.webp";
  } else if (destLower.includes("atlantic") || destLower.includes("seaboard")) {
    src = "/images/journeys/atlantic-seaboard-1600x900.webp";
  } else if (destLower.includes("franschhoek") || destLower.includes("valley")) {
    src = "/images/journeys/franschhoek-valley-1600x900.webp";
  }

  return Object.freeze({
    src,
    alt: `${title} - ${destination} GCT Core Journey`,
    width: 1600,
    height: 900,
  });
}

export class JourneyDetailViewModelProvider {
  public provide(journey: Journey): JourneyDetailViewModel {
    const destination = journey.destinations.map((item) => item.name).join(" + ");
    const title = `${journey.classification.category} ${destination} Journey`;
    const duration = journey.duration.description || `${journey.duration.days} Days / ${journey.duration.nights} Nights`;

    return Object.freeze({
      id: journey.identity.id,
      title,
      subtitle: `${journey.classification.type} experience for curated travel`,
      destination,
      destinations: Object.freeze(journey.destinations.map((item) => item.name)),
      duration,
      summary: undefined,
      image: createJourneyHeroImage(title, destination),
      itinerary: Object.freeze(
        journey.experiences.reduce<Array<{ day: number; title?: string; experiences: string[] }>>((days, experience) => {
          if (!experience.sequence) {
            return days;
          }

          const day = days.find((item) => item.day === experience.sequence?.day);
          if (day) {
            day.experiences.push(experience.name);
            return days;
          }

          days.push({
            day: experience.sequence.day,
            title: experience.sequence.itineraryLabel,
            experiences: [experience.name],
          });
          return days;
        }, []).map((item) => Object.freeze({
          day: item.day,
          title: item.title,
          experiences: Object.freeze([...item.experiences]),
        })),
      ),
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
        type: experience.type,
        sequence: experience.sequence?.order,
        day: experience.sequence?.day,
      }))),
      pricing: Object.freeze({ state: "UNAVAILABLE" as const }),
      
      primaryCTA: Object.freeze({ label: "Select this journey", href: `/ui/journeys/${journey.identity.id}/select`, style: "primary" }),
      selectionAction: Object.freeze({ label: "Select this journey", href: `/ui/journeys/${journey.identity.id}/select`, style: "primary" }),
    });
  }
}