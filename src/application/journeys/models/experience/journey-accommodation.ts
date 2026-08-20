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
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly approvedAccommodationIds?: ReadonlyArray<string>;
}

export interface JourneyAccommodationSelection {
  readonly accommodationId: string;
  readonly packageStopId?: string;
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

  const room = option.roomOptions?.find((candidate) =>
    candidate.reference.provider === selection.roomReference.provider &&
    candidate.reference.opaqueReference === selection.roomReference.opaqueReference,
  );
  if (!room) throw new Error("Selected room does not belong to the accommodation option.");

  const rate = room.rateOptions.find((candidate) =>
    candidate.reference.provider === selection.rateReference.provider &&
    candidate.reference.opaqueReference === selection.rateReference.opaqueReference,
  );
  if (!rate) throw new Error("Selected rate does not belong to the selected room.");
  if (rate.status !== "BOOKABLE" && rate.status !== "RECHECK_REQUIRED") {
    throw new Error("Selected rate is not available.");
  }

  const provider = rate.reference.provider;
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
      room,
      rate,
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
      room,
      rate,
      occupancy: option.requestedOccupancy,
      provider,
      supplierReference: rate.reference,
    }),
  });
}