import {
  AccommodationAvailabilityOccupancy,
  AccommodationRateOption,
  AccommodationRoomOption,
  AccommodationSupplierReference,
} from "../../../accommodation";
import { Accommodation } from "../../../accommodation";

export interface JourneyPackageStop {
  readonly packageId: string;
  readonly stopId: string;
  readonly stopOrder: number;
  readonly destination?: string;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly approvedAccommodationIds?: ReadonlyArray<string>;
}

export interface JourneyAccommodationSelection {
  readonly accommodationId: string;
  readonly packageStopId?: string;
  readonly roomReference: AccommodationSupplierReference;
  readonly rateReference: AccommodationSupplierReference;
  readonly roomSelections?: ReadonlyArray<JourneyRoomRateSelection>;
}

export interface JourneyRoomRateSelection {
  readonly roomReference: AccommodationSupplierReference;
  readonly rateReference: AccommodationSupplierReference;
}

export interface JourneyAccommodationPricingInput {
  readonly packageId?: string;
  readonly packageStopId?: string;
  readonly stopOrder?: number;
  readonly accommodation?: Accommodation;
  readonly stayPeriod?: { readonly checkIn: Date; readonly checkOut: Date };
  readonly accommodationId: string;
  readonly room: AccommodationRoomOption;
  readonly rate: AccommodationRateOption;
  readonly roomRates?: ReadonlyArray<{ readonly room: AccommodationRoomOption; readonly rate: AccommodationRateOption }>;
  readonly occupancy?: AccommodationAvailabilityOccupancy;
}

export interface JourneyAccommodationReservationInput extends JourneyAccommodationPricingInput {
  readonly provider: string;
  readonly supplierReference: AccommodationSupplierReference;
}

export interface JourneyAccommodation {
  readonly accommodationId: string;
  readonly name: string;
  readonly accommodation?: Accommodation;
  readonly packageStop?: JourneyPackageStop;
  readonly provider?: string;
  readonly roomOptions?: ReadonlyArray<AccommodationRoomOption>;
  readonly requestedOccupancy?: AccommodationAvailabilityOccupancy;
  readonly selection?: JourneyAccommodationSelection;
  readonly pricingInput?: JourneyAccommodationPricingInput;
  readonly reservationInput?: JourneyAccommodationReservationInput;
}

export function selectJourneyAccommodation(
  option: JourneyAccommodation,
  selection: JourneyAccommodationSelection,
): JourneyAccommodation {
  if (option.accommodationId !== selection.accommodationId) {
    throw new Error("Selected accommodation does not belong to the package stop option.");
  }
  if (option.packageStop && selection.packageStopId && option.packageStop.stopId !== selection.packageStopId) {
    throw new Error("Selected accommodation belongs to another package stop.");
  }

  const requestedRoomSelections = selection.roomSelections ?? [{
    roomReference: selection.roomReference,
    rateReference: selection.rateReference,
  }];
  if (requestedRoomSelections.length === 0) throw new Error("At least one room and rate selection is required.");
  const roomRates = requestedRoomSelections.map((roomSelection) => {
    const room = option.roomOptions?.find((candidate) =>
      candidate.reference.provider === roomSelection.roomReference.provider
      && candidate.reference.opaqueReference === roomSelection.roomReference.opaqueReference,
    );
    if (!room) throw new Error("Selected room does not belong to the accommodation option.");
    const rate = room.rateOptions.find((candidate) =>
      candidate.reference.provider === roomSelection.rateReference.provider
      && candidate.reference.opaqueReference === roomSelection.rateReference.opaqueReference,
    );
    if (!rate) throw new Error("Selected rate does not belong to the selected room.");
    if (rate.status !== "BOOKABLE" && rate.status !== "RECHECK_REQUIRED") {
      throw new Error("Selected rate is not available.");
    }
    return Object.freeze({ room, rate });
  });
  const firstRoomRate = roomRates[0]!;
  const currency = firstRoomRate.rate.pricing.currency;
  if (roomRates.some(({ rate }) => rate.pricing.currency !== currency)) {
    throw new Error("Selected room rates must use the same currency.");
  }
  const rate = Object.freeze({
    ...firstRoomRate.rate,
    pricing: Object.freeze({
      ...firstRoomRate.rate.pricing,
      amount: roomRates.reduce((total, item) => total + item.rate.pricing.amount, 0),
    }),
    occupancy: option.requestedOccupancy ?? firstRoomRate.rate.occupancy,
    status: roomRates.some((item) => item.rate.status === "RECHECK_REQUIRED") ? "RECHECK_REQUIRED" as const : "BOOKABLE" as const,
  });
  const provider = firstRoomRate.rate.reference.provider;
  return Object.freeze({
    ...option,
    selection: Object.freeze(selection),
    pricingInput: Object.freeze({
      packageId: option.packageStop?.packageId,
      packageStopId: option.packageStop?.stopId,
      stopOrder: option.packageStop?.stopOrder,
      accommodation: option.accommodation,
      stayPeriod: option.packageStop
        ? { checkIn: option.packageStop.checkInDate, checkOut: option.packageStop.checkOutDate }
        : undefined,
      accommodationId: option.accommodationId,
      room: firstRoomRate.room,
      rate,
      roomRates: Object.freeze(roomRates),
      occupancy: option.requestedOccupancy,
    }),
    reservationInput: Object.freeze({
      packageId: option.packageStop?.packageId,
      packageStopId: option.packageStop?.stopId,
      stopOrder: option.packageStop?.stopOrder,
      accommodation: option.accommodation,
      stayPeriod: option.packageStop
        ? { checkIn: option.packageStop.checkInDate, checkOut: option.packageStop.checkOutDate }
        : undefined,
      accommodationId: option.accommodationId,
      room: firstRoomRate.room,
      rate,
      roomRates: Object.freeze(roomRates),
      occupancy: option.requestedOccupancy,
      provider,
      supplierReference: rate.reference,
    }),
  });
}