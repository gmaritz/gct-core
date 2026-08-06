export interface HomepageJourneyImageViewModel {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface HomepageJourneyPriceViewModel {
  readonly amount: number;
  readonly currency: string;
  readonly display: string;
}

export interface HomepageJourneyCtaViewModel {
  readonly label: string;
  readonly href: string;
  readonly style: string;
}

export interface HomepageJourneyViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly destination: string;
  readonly duration: string;
  readonly image: HomepageJourneyImageViewModel;
  readonly highlights: ReadonlyArray<string>;
  readonly accommodationSummary: string;
  readonly experienceSummary: string;
  readonly price?: HomepageJourneyPriceViewModel;
  readonly badges: ReadonlyArray<string>;
  readonly primaryCTA: HomepageJourneyCtaViewModel;
}

export function createHomepageJourneyViewModel(
  model: HomepageJourneyViewModel,
): HomepageJourneyViewModel {
  return Object.freeze({
    id: model.id,
    title: model.title,
    subtitle: model.subtitle,
    destination: model.destination,
    duration: model.duration,
    image: Object.freeze({ ...model.image }),
    highlights: Object.freeze([...model.highlights]),
    accommodationSummary: model.accommodationSummary,
    experienceSummary: model.experienceSummary,
    price: model.price ? Object.freeze({ ...model.price }) : undefined,
    badges: Object.freeze([...model.badges]),
    primaryCTA: Object.freeze({ ...model.primaryCTA }),
  });
}