import { ReservationStatus } from "../aggregate";
import { ReservationResult } from "../service";
import {
  createReservationViewModel,
  ReservationLifecyclePresentationModel,
  ReservationPresentationModel,
  ReservationViewModel,
} from "./models";
import { ReservationPresentationMapper } from "./reservation-presentation-mapper";

function resolveStatusBadgeStyle(status: ReservationStatus): string {
  switch (status) {
    case ReservationStatus.CONFIRMED:
    case ReservationStatus.COMPLETED:
      return "success";
    case ReservationStatus.CANCELLED:
      return "danger";
    default:
      return "warning";
  }
}

function createTimelineHeadline(lifecycle: ReservationLifecyclePresentationModel): string {
  const latest = lifecycle.timelineSummary[lifecycle.timelineSummary.length - 1];

  if (!latest) {
    return "No timeline milestones yet";
  }

  return `${latest.milestone} on ${latest.occurredAt.toISOString().slice(0, 10)}`;
}

export class ReservationViewModelProvider {
  public constructor(
    private readonly mapper: ReservationPresentationMapper = new ReservationPresentationMapper(),
  ) {}

  public provideViewModel(
    reservation: ReservationPresentationModel,
    lifecycle: ReservationLifecyclePresentationModel,
  ): ReservationViewModel {
    const travellerLabel = pluralizeTravellers(
      reservation.travellers.travellerCount,
      reservation.travellers.leadTraveller,
    );
    const pricingSummary = reservation.pricingSummary?.display ?? "Price pending";
    const paymentProgress = reservation.paymentSummary?.progressLabel ?? "Payment details pending";

    return createReservationViewModel({
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

  public mapReservationResultToViewModel(result: ReservationResult): ReservationViewModel | null {
    const presentation = this.mapper.map(result);

    if (!presentation) {
      return null;
    }

    return this.provideViewModel(presentation.reservation, presentation.lifecycle);
  }
}

function pluralizeTravellers(travellerCount: number, leadTraveller: string): string {
  if (travellerCount <= 1) {
    return leadTraveller;
  }

  return `${leadTraveller} +${travellerCount - 1}`;
}
