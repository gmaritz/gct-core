"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationPresentationModel = createReservationPresentationModel;
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeJourney(journey) {
    return Object.freeze({
        journeyId: journey.journeyId,
        title: journey.title,
        destination: journey.destination,
        duration: journey.duration,
    });
}
function freezeTravellers(travellers) {
    return Object.freeze({
        travellerCount: travellers.travellerCount,
        leadTraveller: travellers.leadTraveller,
    });
}
function freezePricing(pricing) {
    if (!pricing) {
        return undefined;
    }
    return Object.freeze({
        amount: pricing.amount,
        currency: pricing.currency,
        display: pricing.display,
    });
}
function freezePayment(payment) {
    if (!payment) {
        return undefined;
    }
    return Object.freeze({
        paymentStatus: payment.paymentStatus,
        amountReceived: payment.amountReceived,
        balanceOutstanding: payment.balanceOutstanding,
        progressLabel: payment.progressLabel,
    });
}
function createReservationPresentationModel(model) {
    return Object.freeze({
        reservationNumber: model.reservationNumber,
        journey: freezeJourney(model.journey),
        travellers: freezeTravellers(model.travellers),
        accommodationSummary: model.accommodationSummary,
        pricingSummary: freezePricing(model.pricingSummary),
        paymentSummary: freezePayment(model.paymentSummary),
        warnings: Object.freeze([...model.warnings]),
        metadata: Object.freeze({
            generatedAt: cloneDate(model.metadata.generatedAt),
            version: model.metadata.version,
            requestId: model.metadata.requestId,
        }),
    });
}
//# sourceMappingURL=reservation-presentation-model.js.map