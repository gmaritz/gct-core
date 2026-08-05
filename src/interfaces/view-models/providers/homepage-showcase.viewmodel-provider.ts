import { CTAViewModel } from "../shared/cta.viewmodel";
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

function createJourneyCard(input: {
  variant: "primary" | "secondary";
  ariaLabel: string;
  id: string;
  title: string;
  destination: string;
  duration: string;
  imageLabel: string;
  highlights: string[];
  price: string;
  saving: string;
  ctaLabel: string;
  ctaHref: string;
  ctaStyle: CTAViewModel["style"];
}): JourneyCardViewModel {
  return {
    variant: input.variant,
    ariaLabel: input.ariaLabel,
    id: input.id,
    title: input.title,
    destination: input.destination,
    duration: input.duration,
    image: createPlaceholderImage(input.imageLabel),
    highlights: input.highlights,
    price: createPrice(input.price),
    saving: createSaving(input.saving),
    primaryCTA: {
      label: input.ctaLabel,
      href: input.ctaHref,
      style: input.ctaStyle,
    },
  };
}

export function getHomepageShowcaseViewModel(): HomepageShowcaseViewModel {
  return {
    editorial: {
      eyebrow: "Curated Private Journeys",
      heading: "Discover South Africa Through Carefully Curated Journeys.",
      narrative:
        "From the vineyards of Stellenbosch to the coastline of the Garden Route, every Go Cape Tours journey combines exceptional accommodation, authentic experiences and local expertise to create unforgettable memories.",
      primaryCTA: {
        label: "Explore Experiences",
        href: "#featured-experiences",
        style: "primary",
      },
      secondaryCTA: {
        label: "Plan Your Journey",
        href: "#journey-planning",
        style: "secondary",
      },
    },
    journeys: [
      createJourneyCard({
        variant: "primary",
        ariaLabel: "Primary journey",
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
        price: "From R18 950 per couple",
        saving: "Save 22%",
        ctaLabel: "View Journey",
        ctaHref: "#journey-planning",
        ctaStyle: "primary",
      }),
      createJourneyCard({
        variant: "secondary",
        ariaLabel: "Secondary journey one",
        id: "ocean-vineyard-retreat",
        title: "Ocean & Vineyard Retreat",
        destination: "Atlantic Seaboard",
        duration: "3 Days / 2 Nights",
        imageLabel: "Coastal journey landscape",
        highlights: [
          "Coastal estates",
          "Sunset tastings",
          "Private guide",
        ],
        price: "From R12 400 per couple",
        saving: "Save 18%",
        ctaLabel: "View Journey",
        ctaHref: "#journey-planning",
        ctaStyle: "secondary",
      }),
      createJourneyCard({
        variant: "secondary",
        ariaLabel: "Secondary journey two",
        id: "mountain-valley-signature",
        title: "Mountain Valley Signature",
        destination: "Franschhoek Valley",
        duration: "5 Days / 4 Nights",
        imageLabel: "Mountain and valley journey landscape",
        highlights: [
          "Scenic rail moments",
          "Chef tables",
          "Private transfers",
        ],
        price: "From R21 300 per couple",
        saving: "Save 15%",
        ctaLabel: "View Journey",
        ctaHref: "#journey-planning",
        ctaStyle: "secondary",
      }),
    ],
    metadata: {
      generatedAt: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
    },
  };
}
