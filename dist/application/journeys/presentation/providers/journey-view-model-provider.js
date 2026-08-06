"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyViewModelProvider = void 0;
const journey_presentation_mapper_1 = require("../mapper/journey-presentation-mapper");
const homepage_journey_viewmodel_1 = require("../view-models/homepage-journey.viewmodel");
class JourneyViewModelProvider {
    constructor(mapper = new journey_presentation_mapper_1.JourneyPresentationMapper()) {
        this.mapper = mapper;
    }
    provideHomepageJourney(model) {
        return (0, homepage_journey_viewmodel_1.createHomepageJourneyViewModel)({
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
    mapCompositionResultToHomepageJourney(result) {
        const model = this.mapper.map(result);
        if (!model) {
            return null;
        }
        return this.provideHomepageJourney(model);
    }
}
exports.JourneyViewModelProvider = JourneyViewModelProvider;
//# sourceMappingURL=journey-view-model-provider.js.map