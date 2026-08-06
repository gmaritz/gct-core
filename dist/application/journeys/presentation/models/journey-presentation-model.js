"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJourneyPresentationModel = createJourneyPresentationModel;
function freezeImage(image) {
    return Object.freeze({
        src: image.src,
        alt: image.alt,
        width: image.width,
        height: image.height,
    });
}
function freezePrice(price) {
    if (!price) {
        return undefined;
    }
    return Object.freeze({
        amount: price.amount,
        currency: price.currency,
        display: price.display,
    });
}
function freezeCallToAction(callToAction) {
    return Object.freeze({
        label: callToAction.label,
        href: callToAction.href,
    });
}
function createJourneyPresentationModel(model) {
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
//# sourceMappingURL=journey-presentation-model.js.map