import { JourneyPresentationMapper } from "../mapper/journey-presentation-mapper";
import { JourneyPresentationModel } from "../models/journey-presentation-model";
import {
  createHomepageJourneyViewModel,
  HomepageJourneyViewModel,
} from "../view-models/homepage-journey.viewmodel";

export class JourneyViewModelProvider {
  public constructor(
    private readonly mapper: JourneyPresentationMapper = new JourneyPresentationMapper(),
  ) {}

  public provideHomepageJourney(
    model: JourneyPresentationModel,
  ): HomepageJourneyViewModel {
    return createHomepageJourneyViewModel({
      id: model.identity,
      title: model.title,
      subtitle: model.subtitle,
      destination: model.destination,
      duration: model.duration,
      image: {
        src: model.heroImage.src,
        alt: model.heroImage.alt,
        width: model.heroImage.width,
        height: model.heroImage.height,
      },
      highlights: model.highlights,
      accommodationSummary: model.accommodationSummary,
      experienceSummary: model.experienceSummary,
      price: model.primaryPrice
        ? {
            amount: model.primaryPrice.amount,
            currency: model.primaryPrice.currency,
            display: model.primaryPrice.display,
          }
        : undefined,
      badges: model.badges,
      primaryCTA: {
        label: model.callToAction.label,
        href: model.callToAction.href,
        style: "primary",
      },
    });
  }

  public mapCompositionResultToHomepageJourney(
    result: Parameters<JourneyPresentationMapper["map"]>[0],
  ): HomepageJourneyViewModel | null {
    const model = this.mapper.map(result);

    if (!model) {
      return null;
    }

    return this.provideHomepageJourney(model);
  }
}