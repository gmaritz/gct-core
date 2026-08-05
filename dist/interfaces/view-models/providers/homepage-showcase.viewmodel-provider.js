"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomepageShowcaseViewModel = getHomepageShowcaseViewModel;
const merchandising_1 = require("../../../application/merchandising");
function createPlaceholderImage(label) {
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
function createPrice(display) {
    return {
        amount: Number(display.replace(/[^\d]/g, "")),
        currency: "ZAR",
        display,
    };
}
function createSaving(display) {
    return {
        percentage: Number(display.replace(/[^\d]/g, "")),
        display,
    };
}
function mapJourneyToViewModel(journey, index) {
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
function mapMetadataToViewModel(metadata) {
    return {
        generatedAt: new Date(metadata.generatedAt),
        version: metadata.version,
    };
}
function mapMerchandisingToViewModel(result) {
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
        journeys: result.journeys.map((journey, index) => mapJourneyToViewModel(journey, index)),
        metadata: mapMetadataToViewModel(result.metadata),
    };
}
async function getHomepageShowcaseViewModel(service = new merchandising_1.DefaultHomepageMerchandisingService()) {
    const merchandisingResult = await service.getHomepageMerchandising();
    return mapMerchandisingToViewModel(merchandisingResult);
}
//# sourceMappingURL=homepage-showcase.viewmodel-provider.js.map