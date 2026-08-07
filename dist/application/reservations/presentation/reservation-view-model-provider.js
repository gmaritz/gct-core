"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationViewModelProvider = void 0;
const aggregate_1 = require("../aggregate");
const models_1 = require("./models");
const reservation_presentation_mapper_1 = require("./reservation-presentation-mapper");
function resolveStatusBadgeStyle(status) {
    switch (status) {
        case aggregate_1.ReservationStatus.CONFIRMED:
        case aggregate_1.ReservationStatus.COMPLETED:
            return "success";
        case aggregate_1.ReservationStatus.CANCELLED:
            return "danger";
        default:
            return "warning";
    }
}
function createTimelineHeadline(lifecycle) {
    const latest = lifecycle.timelineSummary[lifecycle.timelineSummary.length - 1];
    if (!latest) {
        return "No timeline milestones yet";
    }
    return `${latest.milestone} on ${latest.occurredAt.toISOString().slice(0, 10)}`;
}
class ReservationViewModelProvider {
    constructor(mapper = new reservation_presentation_mapper_1.ReservationPresentationMapper()) {
        this.mapper = mapper;
    }
    provideViewModel(reservation, lifecycle) {
        const travellerLabel = pluralizeTravellers(reservation.travellers.travellerCount, reservation.travellers.leadTraveller);
        const pricingSummary = reservation.pricingSummary?.display ?? "Price pending";
        const paymentProgress = reservation.paymentSummary?.progressLabel ?? "Payment details pending";
        return (0, models_1.createReservationViewModel)({
            id: reservation.reservationNumber,
            title: reservation.journey.title,
            subtitle: reservation.journey.destination,
            status: lifecycle.status,
            statusBadgeStyle: resolveStatusBadgeStyle(lifecycle.status),
            travellers: travellerLabel,
            accommodationSummary: reservation.accommodationSummary,
            pricingSummary,
            payment: {
                status: reservation.paymentSummary?.paymentStatus ?? "PENDING",
                progress: paymentProgress,
            },
            timelineHeadline: createTimelineHeadline(lifecycle),
            outstandingActions: lifecycle.outstandingActions,
            warnings: reservation.warnings,
            nextAction: {
                label: lifecycle.nextRecommendedAction,
                href: `#reservation-${reservation.reservationNumber}`,
                style: lifecycle.nextRecommendedAction === "No immediate action required" ? "neutral" : "primary",
            },
            metadata: {
                generatedAt: new Date(reservation.metadata.generatedAt.getTime()),
                version: reservation.metadata.version,
                requestId: reservation.metadata.requestId,
            },
        });
    }
    mapReservationResultToViewModel(result) {
        const presentation = this.mapper.map(result);
        if (!presentation) {
            return null;
        }
        return this.provideViewModel(presentation.reservation, presentation.lifecycle);
    }
}
exports.ReservationViewModelProvider = ReservationViewModelProvider;
function pluralizeTravellers(travellerCount, leadTraveller) {
    if (travellerCount <= 1) {
        return leadTraveller;
    }
    return `${leadTraveller} +${travellerCount - 1}`;
}
//# sourceMappingURL=reservation-view-model-provider.js.map