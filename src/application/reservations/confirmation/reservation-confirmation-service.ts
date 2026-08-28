import { Reservation, ReservationStatus } from "../aggregate";
import { ReservationRepository } from "../repository";

export type ReservationConfirmationStatus = "CONFIRMED" | "PENDING" | "FAILED" | "CANCELLED" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";

export interface ReservationConfirmationResult {
  readonly status: ReservationConfirmationStatus;
  readonly journeyId: string;
  readonly reservation?: Reservation;
  readonly paymentStatus?: string;
  readonly fulfilmentStatus?: string;
  readonly errors: ReadonlyArray<string>;
}

export interface ReservationConfirmationService {
  resolve(journeyId: string): Promise<ReservationConfirmationResult>;
}

function paymentState(reservation: Reservation): string | undefined {
  return reservation.paymentSnapshot?.paymentStatus?.trim().toUpperCase();
}

function fulfilmentState(reservation: Reservation): string {
  const supplierStates = reservation.bookingItems.flatMap((item) =>
    (item.supplierBookings ?? []).map((supplier) => supplier.status.trim().toUpperCase()),
  );
  if (supplierStates.length === 0) {
    return reservation.supplierReferences.length > 0 ? "CONFIRMED" : "PENDING";
  }
  if (supplierStates.some((status) => status === "FAILED" || status === "CANCELLED")) {
    return "FAILED";
  }
  return supplierStates.every((status) => status === "CONFIRMED" || status === "COMPLETED")
    ? "CONFIRMED"
    : "PENDING";
}

function resolveStatus(reservation: Reservation): ReservationConfirmationStatus {
  if (reservation.status === ReservationStatus.CANCELLED) return "CANCELLED";
  const payment = paymentState(reservation);
  if (payment === "FAILED") return "FAILED";
  if (payment === "CANCELLED") return "CANCELLED";
  if (!payment || !["COMPLETED", "PAID", "SETTLED", "CAPTURED"].includes(payment)) return "PENDING";
  if (reservation.status !== ReservationStatus.CONFIRMED && reservation.status !== ReservationStatus.COMPLETED) return "PENDING";
  return fulfilmentState(reservation) === "CONFIRMED" ? "CONFIRMED" : "PENDING";
}

export class DefaultReservationConfirmationService implements ReservationConfirmationService {
  public constructor(private readonly repository: ReservationRepository) {}

  public async resolve(journeyId: string): Promise<ReservationConfirmationResult> {
    if (typeof journeyId !== "string" || !/^journey-[a-z0-9-]+$/i.test(journeyId)) {
      return { status: "INVALID", journeyId, errors: ["The journey reference is invalid."] };
    }
    const reservations = await this.repository.findByJourneyId(journeyId);
    const reservation = reservations[0];
    if (!reservation) return { status: "NOT_FOUND", journeyId, errors: ["The reservation could not be found."] };
    return {
      status: resolveStatus(reservation),
      journeyId,
      reservation,
      paymentStatus: paymentState(reservation),
      fulfilmentStatus: fulfilmentState(reservation),
      errors: [],
    };
  }
}