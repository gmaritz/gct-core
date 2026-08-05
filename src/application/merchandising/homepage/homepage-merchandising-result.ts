export interface HomepageMerchandisingEditorial {
  eyebrow: string;
  heading: string;
  narrative: string;
  primaryCallToActionLabel: string;
  primaryCallToActionHref: string;
  secondaryCallToActionLabel: string;
  secondaryCallToActionHref: string;
}

export interface HomepageMerchandisingJourney {
  id: string;
  title: string;
  destination: string;
  duration: string;
  imageLabel: string;
  highlights: string[];
  priceDisplay: string;
  savingDisplay: string;
  primaryCallToActionLabel: string;
  primaryCallToActionHref: string;
  isPrimary: boolean;
}

export interface HomepageMerchandisingMetadata {
  generatedAt: Date;
  version: string;
  source: string;
}

export interface HomepageMerchandisingResult {
  editorial: HomepageMerchandisingEditorial;
  journeys: HomepageMerchandisingJourney[];
  metadata: HomepageMerchandisingMetadata;
}
