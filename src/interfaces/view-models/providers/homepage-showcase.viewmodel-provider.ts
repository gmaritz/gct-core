import {
  DefaultHomepageMerchandisingService,
  createDefaultHomepageJourneyShowcaseService,
  HomepageMerchandisingJourney,
  HomepageMerchandisingMetadata,
  HomepageMerchandisingResult,
  HomepageMerchandisingService,
} from "../../../application/merchandising";
import { HomepageShowcaseViewModel } from "../homepage/homepage-showcase.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";
import { JourneyCardViewModel } from "../journeys/journey-card.viewmodel";
import { PriceViewModel } from "../shared/price.viewmodel";
import { SavingViewModel } from "../shared/saving.viewmodel";

function createMerchandisingImage(label: string, destination?: string): ImageViewModel {
  const destLower = (destination || label).toLowerCase();
  let src = "/images/hero/hero-cape-town-1600x900.webp";
  if (destLower.includes("winelands")) {
    src = "/images/journeys/cape-winelands-1600x900.webp";
  } else if (destLower.includes("atlantic") || destLower.includes("seaboard")) {
    src = "/images/journeys/atlantic-seaboard-1600x900.webp";
  } else if (destLower.includes("franschhoek") || destLower.includes("valley")) {
    src = "/images/journeys/franschhoek-valley-1600x900.webp";
  }

  return {
    src,
    alt: label,
    width: 1600,
    height: 900,
  };
}

function createPrice(display: string): PriceViewModel {
  return {
    amount: Number(display.replace(/[^\d]/g, "")),
    currency: "ZAR",
    display,
  };
}

function createSaving(display: string): SavingViewModel {
  return {
    percentage: Number(display.replace(/[^\d]/g, "")),
    display,
  };
}

function mapJourneyToViewModel(
  journey: HomepageMerchandisingJourney,
  index: number
): JourneyCardViewModel {
  const variant = journey.isPrimary ? "primary" : "secondary";
  const ariaLabel = journey.isPrimary
    ? "Primary journey"
    : index === 1
      ? "Secondary journey one"
      : "Secondary journey two";

  return {
    variant,
    ariaLabel,
    id: journey.id,
    title: journey.title,
    destination: journey.destination,
    duration: journey.duration,
    image: createMerchandisingImage(journey.imageLabel, journey.destination),
    highlights: [...journey.highlights],
    price: createPrice(journey.priceDisplay),
    saving: createSaving(journey.savingDisplay),
    primaryCTA: {
      label: journey.primaryCallToActionLabel,
      href: journey.primaryCallToActionHref,
      style: journey.isPrimary ? "primary" : "secondary",
    },
  };
}

function mapMetadataToViewModel(
  metadata: HomepageMerchandisingMetadata
): HomepageShowcaseViewModel["metadata"] {
  return {
    generatedAt: new Date(metadata.generatedAt),
    version: metadata.version,
  };
}

function mapMerchandisingToViewModel(
  result: HomepageMerchandisingResult
): HomepageShowcaseViewModel {
  return {
    editorial: {
      eyebrow: result.editorial.eyebrow,
      heading: result.editorial.heading,
      narrative: result.editorial.narrative,
      primaryCTA: {
        label: result.editorial.primaryCallToActionLabel,
        href: result.editorial.primaryCallToActionHref,
        style: "primary",
      },
      secondaryCTA: {
        label: result.editorial.secondaryCallToActionLabel,
        href: result.editorial.secondaryCallToActionHref,
        style: "secondary",
      },
    },
    journeys: result.journeys.map((journey, index) =>
      mapJourneyToViewModel(journey, index)
    ),
    metadata: mapMetadataToViewModel(result.metadata),
  };
}

function mapHomepageJourneyToViewModel(
  journey: import("../../../application/journeys").HomepageJourneyViewModel,
  index: number,
): JourneyCardViewModel {
  const variant = index === 0 ? "primary" : "secondary";
  const ariaLabel = index === 0
    ? "Primary journey"
    : index === 1
      ? "Secondary journey one"
      : "Secondary journey two";

  return {
    variant,
    ariaLabel,
    id: journey.id,
    title: journey.title,
    destination: journey.destination,
    duration: journey.duration,
    image: {
      src: journey.image.src,
      alt: journey.image.alt,
      width: journey.image.width,
      height: journey.image.height,
    },
    highlights: [...journey.highlights],
    price: journey.price ?? {
      amount: 0,
      currency: "ZAR",
      display: "Price on request",
    },
    saving: {
      percentage: 0,
      display: "Curated Journey",
    },
    primaryCTA: {
      label: journey.primaryCTA.label,
      href: journey.primaryCTA.href,
      style: variant === "primary" ? "primary" : "secondary",
    },
  };
}

export async function getHomepageShowcaseViewModel(
  service: HomepageMerchandisingService = new DefaultHomepageMerchandisingService(),
  showcaseService: Pick<ReturnType<typeof createDefaultHomepageJourneyShowcaseService>, "execute"> = createDefaultHomepageJourneyShowcaseService(),
): Promise<HomepageShowcaseViewModel> {
  const [merchandisingResult, showcaseResult] = await Promise.all([
    service.getHomepageMerchandising(),
    showcaseService.execute(),
  ]);

  const baseViewModel = mapMerchandisingToViewModel(merchandisingResult);

  const journeys = showcaseResult.success && showcaseResult.featuredJourneys.length > 0
    ? showcaseResult.featuredJourneys.map((journey, index) => mapHomepageJourneyToViewModel(journey, index))
    : baseViewModel.journeys;

  return {
    ...baseViewModel,
    journeys,
  };
}
