import { JourneyAccommodationPricingInput, JourneyAccommodationReservationInput } from "../../journeys/models";
import { AccommodationBookingGuest, AccommodationBookingHolder } from "../../accommodation/booking";
import { AccommodationBookingRequest } from "../../accommodation/booking";
import { AccommodationAvailabilityOccupancy } from "../../accommodation/results";
import { AccommodationSnapshot } from "../models";

export interface AccommodationReservationHandoffInput {
  readonly packageId: string;
  readonly pricingInputs: ReadonlyArray<JourneyAccommodationPricingInput>;
  readonly reservationInputs: ReadonlyArray<JourneyAccommodationReservationInput>;
  readonly finalPackagePrice: { readonly amount: number; readonly currency: string };
  readonly holder: AccommodationBookingHolder;
  readonly guests: ReadonlyArray<AccommodationBookingGuest>;
  readonly idempotencyKey: string;
}

export interface AccommodationReservationHandoff {
  readonly accommodationSnapshots: ReadonlyArray<AccommodationSnapshot>;
  readonly finalPackagePrice: { readonly amount: number; readonly currency: string };
  readonly bookingRequests: ReadonlyArray<AccommodationBookingRequest>;
}

function matchingReservationInput(
  input: AccommodationReservationHandoffInput,
  pricing: JourneyAccommodationPricingInput,
): JourneyAccommodationReservationInput {
  const result = input.reservationInputs.find((candidate) => candidate.packageStopId === pricing.packageStopId);
  if (!result) throw new Error(`Missing reservation input for package stop ${pricing.packageStopId}.`);
  return result;
}

function validateOccupancy(occupancy: AccommodationAvailabilityOccupancy | undefined): void {
  if (!occupancy || occupancy.rooms.length === 0) throw new Error("Accommodation reservation occupancy is required.");
  if (occupancy.rooms.some((room) => room.adults < 1 || room.children !== room.childAges.length)) {
    throw new Error("Accommodation reservation occupancy is invalid.");
  }
}

export function createAccommodationReservationSnapshots(
  input: AccommodationReservationHandoffInput,
): ReadonlyArray<AccommodationSnapshot> {
  if (!input.packageId.trim()) throw new Error("Package identity is required for reservation handoff.");
  if (input.pricingInputs.length === 0) throw new Error("At least one accommodation pricing input is required.");
  const seenStops = new Set<string>();

  return Object.freeze(input.pricingInputs.map((pricing) => {
    const stopId = pricing.packageStopId?.trim();
    if (!stopId || seenStops.has(stopId)) throw new Error("Accommodation pricing inputs must have unique package stops.");
    seenStops.add(stopId);
    validateOccupancy(pricing.occupancy ?? pricing.rate.occupancy);
    if (!Number.isFinite(pricing.rate.pricing.amount) || pricing.rate.pricing.amount <= 0) {
      throw new Error("Accommodation reservation requires a positive supplier price.");
    }
    const reservation = matchingReservationInput(input, pricing);
    return Object.freeze({
      snapshotId: `accommodation-${input.packageId}-${stopId}`,
      capturedAt: new Date(),
      version: "1.0.0",
      accommodationId: pricing.accommodationId,
      propertyName: pricing.accommodation?.identity.name ?? pricing.accommodationId,
      roomType: pricing.room.name,
      checkInDate: pricing.stayPeriod?.checkIn,
      checkOutDate: pricing.stayPeriod?.checkOut,
      packageId: pricing.packageId ?? input.packageId,
      packageStopId: stopId,
      stopOrder: pricing.stopOrder,
      rateReference: Object.freeze({ ...pricing.rate.reference }),
      roomReference: Object.freeze({ ...pricing.room.reference }),
      provider: reservation.provider,
      occupancy: pricing.occupancy ?? pricing.rate.occupancy,
      supplierPrice: Object.freeze({
        amount: pricing.rate.pricing.amount,
        currency: pricing.rate.pricing.currency,
        basis: pricing.rate.pricing.basis,
      }),
    });
  }));
}

export function createAccommodationBookingRequests(
  input: AccommodationReservationHandoffInput,
): ReadonlyArray<AccommodationBookingRequest> {
  const snapshots = createAccommodationReservationSnapshots(input);
  return Object.freeze(input.reservationInputs.map((reservation, index) => {
    const pricing = input.pricingInputs[index];
    if (!pricing) throw new Error("Accommodation pricing and reservation inputs are misaligned.");
    const occupancy = pricing.occupancy ?? pricing.rate.occupancy;
    validateOccupancy(occupancy);
    return Object.freeze({
      accommodation: pricing.accommodation ?? (() => { throw new Error("Selected accommodation is required for booking handoff."); })(),
      room: reservation.room,
      rate: reservation.rate,
      providerReference: reservation.supplierReference,
      stayPeriod: pricing.stayPeriod ?? (() => { throw new Error("Selected stay period is required for booking handoff."); })(),
      occupancy,
      holder: input.holder,
      guests: input.guests,
      packageStopId: pricing.packageStopId,
      idempotencyKey: `${input.idempotencyKey}-${snapshots[index]?.packageStopId ?? index}`,
    });
  }));
}

export function createAccommodationReservationHandoff(
  input: AccommodationReservationHandoffInput,
): AccommodationReservationHandoff {
  if (!Number.isFinite(input.finalPackagePrice.amount) || input.finalPackagePrice.amount < 0) {
    throw new Error("Final package price is invalid.");
  }
  return Object.freeze({
    accommodationSnapshots: createAccommodationReservationSnapshots(input),
    finalPackagePrice: Object.freeze({ ...input.finalPackagePrice }),
    bookingRequests: createAccommodationBookingRequests(input),
  });
}