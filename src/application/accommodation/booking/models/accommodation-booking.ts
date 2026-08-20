import {
  AccommodationAvailabilityOccupancy,
  AccommodationRateOption,
  AccommodationRoomOption,
  AccommodationSupplierReference,
} from "../../results";
import { Accommodation } from "../../models";

export interface AccommodationBookingHolder {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
}

export interface AccommodationBookingGuest {
  readonly roomIndex: number;
  readonly type: "ADULT" | "CHILD";
  readonly firstName: string;
  readonly lastName: string;
  readonly age?: number;
}

export interface AccommodationBookingRequest {
  readonly accommodation: Accommodation;
  readonly room: AccommodationRoomOption;
  readonly rate: AccommodationRateOption;
  readonly providerReference: AccommodationSupplierReference;
  readonly stayPeriod: { readonly checkIn: Date; readonly checkOut: Date };
  readonly occupancy: AccommodationAvailabilityOccupancy;
  readonly holder: AccommodationBookingHolder;
  readonly guests: ReadonlyArray<AccommodationBookingGuest>;
  readonly packageStopId?: string;
  readonly validatedRate?: AccommodationRateOption;
  readonly idempotencyKey: string;
}

export type AccommodationBookingStatus = "CONFIRMED" | "FAILED" | "PENDING" | "UNKNOWN";

export interface AccommodationBookingResult {
  readonly successful: boolean;
  readonly status: AccommodationBookingStatus;
  readonly provider: string;
  readonly accommodation: Accommodation;
  readonly room: AccommodationRoomOption;
  readonly rate: AccommodationRateOption;
  readonly supplierBookingReference?: string;
  readonly supplierPrice?: { readonly amount: number; readonly currency: string };
  readonly packageStopId?: string;
  readonly errors: ReadonlyArray<{ readonly code: string; readonly message: string }>;
  readonly warnings: ReadonlyArray<string>;
}