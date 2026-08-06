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

function createPlaceholderImage(label: string): ImageViewModel {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3d8ad" />
          <stop offset="50%" stop-color="#c58f44" />
          <stop offset="100%" stop-color="#8f5c1a" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#g)" />
      <circle cx="1020" cy="150" r="92" fill="rgba(255,255,255,0.18)" />
      <path d="M0 520 L220 390 L410 470 L620 340 L860 430 L1080 300 L1280 360 L1280 720 L0 720 Z" fill="rgba(255,255,255,0.12)" />
    </svg>
  `.trim();

  return {
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    alt: label,
    width: 1280,
    height: 720,
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
    image: createPlaceholderImage(journey.imageLabel),
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
