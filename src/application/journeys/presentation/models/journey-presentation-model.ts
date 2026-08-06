export interface JourneyPresentationImage {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface JourneyPresentationPrice {
  readonly amount: number;
  readonly currency: string;
  readonly display: string;
}

export interface JourneyPresentationCallToAction {
  readonly label: string;
  readonly href: string;
}

export interface JourneyPresentationModel {
  readonly identity: string;
  readonly title: string;
  readonly subtitle: string;
  readonly destination: string;
  readonly duration: string;
  readonly heroImage: JourneyPresentationImage;
  readonly highlights: ReadonlyArray<string>;
  readonly accommodationSummary: string;
  readonly experienceSummary: string;
  readonly primaryPrice?: JourneyPresentationPrice;
  readonly badges: ReadonlyArray<string>;
  readonly callToAction: JourneyPresentationCallToAction;
}

function freezeImage(image: JourneyPresentationImage): JourneyPresentationImage {
  return Object.freeze({
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
  });
}

function freezePrice(price: JourneyPresentationPrice | undefined): JourneyPresentationPrice | undefined {
  if (!price) {
    return undefined;
  }

  return Object.freeze({
    amount: price.amount,
    currency: price.currency,
    display: price.display,
  });
}

function freezeCallToAction(
  callToAction: JourneyPresentationCallToAction,
): JourneyPresentationCallToAction {
  return Object.freeze({
    label: callToAction.label,
    href: callToAction.href,
  });
}

export function createJourneyPresentationModel(
  model: JourneyPresentationModel,
): JourneyPresentationModel {
  return Object.freeze({
    identity: model.identity,
    title: model.title,
    subtitle: model.subtitle,
    destination: model.destination,
    duration: model.duration,
    heroImage: freezeImage(model.heroImage),
    highlights: Object.freeze([...model.highlights]),
    accommodationSummary: model.accommodationSummary,
    experienceSummary: model.experienceSummary,
    primaryPrice: freezePrice(model.primaryPrice),
    badges: Object.freeze([...model.badges]),
    callToAction: freezeCallToAction(model.callToAction),
  });
}