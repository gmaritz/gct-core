"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHomepageJourneyViewModel = createHomepageJourneyViewModel;
function createHomepageJourneyViewModel(model) {
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
//# sourceMappingURL=homepage-journey.viewmodel.js.map