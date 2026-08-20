import {
  AccommodationAvailabilityOccupancy,
  AccommodationRateOption,
  AccommodationRoomOption,
} from "../../results";
import { Accommodation, AccommodationProviderReference } from "../../models";
import { AccommodationBookingGuest, AccommodationBookingHolder } from "../../booking";

export interface AccommodationBookingModificationChanges {
  readonly stayPeriod?: { readonly checkIn: Date; readonly checkOut: Date };
  readonly occupancy?: AccommodationAvailabilityOccupancy;
  readonly guests?: ReadonlyArray<AccommodationBookingGuest>;
  readonly holder?: AccommodationBookingHolder;
  readonly room?: AccommodationRoomOption;
  readonly rate?: AccommodationRateOption;
}

export interface AccommodationBookingModificationRequest {
  readonly reservationId: string;
  readonly provider: string;
  readonly supplierBookingReference: string;
  readonly reservationStatus: "CONFIRMED" | "CANCELLED" | "UNKNOWN";
  readonly accommodation?: Accommodation;
  readonly providerReference?: AccommodationProviderReference;
  readonly currentOccupancy?: AccommodationAvailabilityOccupancy;
  readonly currentRoom?: AccommodationRoomOption;
  readonly currentRate?: AccommodationRateOption;
  readonly changes: AccommodationBookingModificationChanges;
  readonly packageStopId?: string;
  readonly idempotencyKey: string;
  readonly validatedRate?: AccommodationRateOption;
}

export type AccommodationBookingModificationStatus = "MODIFIED" | "FAILED" | "UNKNOWN" | "UNSUPPORTED";

export interface AccommodationBookingModificationResult {
  readonly successful: boolean;
  readonly status: AccommodationBookingModificationStatus;
  readonly reservationId: string;
  readonly provider: string;
  readonly supplierBookingReference: string;
  readonly accommodation?: Accommodation;
  readonly room?: AccommodationRoomOption;
  readonly rate?: AccommodationRateOption;
  readonly stayPeriod?: { readonly checkIn: Date; readonly checkOut: Date };
  readonly occupancy?: AccommodationAvailabilityOccupancy;
  readonly guests?: ReadonlyArray<AccommodationBookingGuest>;
  readonly holder?: AccommodationBookingHolder;
  readonly supplierPrice?: { readonly amount: number; readonly currency: string };
  readonly modificationCharge?: { readonly amount: number; readonly currency: string; readonly description?: string };
  readonly packageStopId?: string;
  readonly errors: ReadonlyArray<{ readonly code: string; readonly message: string }>;
  readonly warnings: ReadonlyArray<string>;
}