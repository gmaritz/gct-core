import { ReservationStatus } from "../aggregate";
import { ReservationTimelineEntry } from "../models";
import { ReservationResult } from "../service";
import {
  createReservationLifecyclePresentationModel,
  createReservationPresentationModel,
  ReservationLifecyclePresentationModel,
  ReservationPresentationModel,
  ReservationTimelinePresentationEntry,
} from "./models";

export interface ReservationPresentationOutput {
  readonly reservation: ReservationPresentationModel;
  readonly lifecycle: ReservationLifecyclePresentationModel;
}

function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function buildAccommodationSummary(propertyNames: ReadonlyArray<string>): string {
  if (propertyNames.length === 0) {
    return "Accommodation pending";
  }

  if (propertyNames.length === 1) {
    return propertyNames[0]!;
  }

  return `${propertyNames[0]} +${propertyNames.length - 1} more`;
}

function toBookingProgress(status: ReservationStatus): ReservationLifecyclePresentationModel["bookingProgress"] {
  switch (status) {
    case ReservationStatus.CREATED:
      return Object.freeze({ stage: "Created", percentage: 20 });
    case ReservationStatus.QUOTED:
      return Object.freeze({ stage: "Quoted", percentage: 40 });
    case ReservationStatus.CONFIRMED:
      return Object.freeze({ stage: "Confirmed", percentage: 75 });
    case ReservationStatus.AMENDED:
      return Object.freeze({ stage: "Amended", percentage: 85 });
    case ReservationStatus.COMPLETED:
      return Object.freeze({ stage: "Completed", percentage: 100 });
    case ReservationStatus.CANCELLED:
      return Object.freeze({ stage: "Cancelled", percentage: 100 });
    default:
      return Object.freeze({ stage: "In Progress", percentage: 50 });
  }
}

function toTimelineSummary(timeline: ReadonlyArray<ReservationTimelineEntry>): ReadonlyArray<ReservationTimelinePresentationEntry> {
  return Object.freeze(
    [...timeline]
      .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime())
      .map((entry) =>
        Object.freeze({
          milestone: entry.milestone,
          occurredAt: new Date(entry.occurredAt.getTime()),
          note: entry.note,
        }),
      ),
  );
}

function resolveOutstandingActions(result: ReservationResult): ReadonlyArray<string> {
  if (!result.reservation) {
    return Object.freeze(["Retry reservation flow"]);
  }

  const actions: string[] = [];
  const reservation = result.reservation;

  if (
    reservation.status !== ReservationStatus.COMPLETED &&
    reservation.status !== ReservationStatus.CANCELLED
  ) {
    if (reservation.paymentSnapshot && reservation.paymentSnapshot.balanceOutstanding > 0) {
      actions.push("Settle outstanding balance");
    }

    if (reservation.status === ReservationStatus.CREATED || reservation.status === ReservationStatus.QUOTED) {
      actions.push("Confirm reservation");
    }

    if (reservation.supplierReferences.length === 0) {
      actions.push("Await supplier confirmation");
    }
  }

  if (actions.length === 0) {
    return Object.freeze(["No immediate action required"]);
  }

  return Object.freeze(actions.filter((value, index, values) => values.indexOf(value) === index));
}

export class ReservationPresentationMapper {
  public map(result: ReservationResult): ReservationPresentationOutput | null {
    if (!result.successful || !result.reservation) {
      return null;
    }

    const reservation = result.reservation;
    const travellerCount = reservation.travellerSnapshots.length;
    const leadTraveller = reservation.travellerSnapshots[0]?.fullName ?? "Traveller";
    const accommodationNames = reservation.accommodationSnapshots.map((snapshot) => snapshot.propertyName);
    const outstandingActions = resolveOutstandingActions(result);

    const reservationPresentation = createReservationPresentationModel({
      reservationNumber: reservation.identity.id,
      journey: {
        journeyId: reservation.journeySnapshot.journeyId,
        title: reservation.journeySnapshot.title,
        destination: reservation.journeySnapshot.destination ?? "Destination pending",
        duration: reservation.journeySnapshot.duration ?? "Duration pending",
      },
      travellers: {
        travellerCount,
        leadTraveller,
      },
      accommodationSummary: buildAccommodationSummary(accommodationNames),
      pricingSummary: reservation.pricingSnapshot
        ? {
            amount: reservation.pricingSnapshot.totalPrice,
            currency: reservation.pricingSnapshot.currency,
            display: formatMoney(reservation.pricingSnapshot.totalPrice, reservation.pricingSnapshot.currency),
          }
        : undefined,
      paymentSummary: reservation.paymentSnapshot
        ? {
            paymentStatus: reservation.paymentSnapshot.paymentStatus,
            amountReceived: reservation.paymentSnapshot.amountReceived,
            balanceOutstanding: reservation.paymentSnapshot.balanceOutstanding,
            progressLabel: reservation.paymentSnapshot.balanceOutstanding > 0
              ? "Payment outstanding"
              : "Paid in full",
          }
        : undefined,
      warnings: result.warnings,
      metadata: {
        generatedAt: new Date(result.metadata.generatedAt.getTime()),
        version: result.metadata.version,
        requestId: result.metadata.requestId,
      },
    });

    const reservationLifecycle = createReservationLifecyclePresentationModel({
      status: reservation.status,
      bookingProgress: toBookingProgress(reservation.status),
      paymentProgress: {
        paidAmount: reservation.paymentSnapshot?.amountReceived ?? 0,
        outstandingAmount: reservation.paymentSnapshot?.balanceOutstanding ?? 0,
        complete: (reservation.paymentSnapshot?.balanceOutstanding ?? 0) <= 0,
      },
      outstandingActions,
      timelineSummary: toTimelineSummary(reservation.timeline),
      nextRecommendedAction: outstandingActions[0] ?? "No immediate action required",
      metadata: {
        generatedAt: new Date(result.metadata.generatedAt.getTime()),
        version: result.metadata.version,
        requestId: result.metadata.requestId,
      },
    });

    return Object.freeze({
      reservation: reservationPresentation,
      lifecycle: reservationLifecycle,
    });
  }

  public mapFromResult(result: ReservationResult): ReservationPresentationModel | null {
    return this.map(result)?.reservation ?? null;
  }
}
