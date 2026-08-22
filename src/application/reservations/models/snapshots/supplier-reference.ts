import { ReservationSnapshot } from "./reservation-snapshot";

export interface SupplierReference extends ReservationSnapshot {
  readonly providerId: string;
  readonly supplierBookingReference: string;
  readonly confirmationNumber?: string;
  readonly bookingId?: string;
  readonly bookingItemId?: string;
  readonly supplierId?: string;
  readonly reservationReference?: string;
  readonly reservationStatusId?: string;
  readonly reservedAt?: Date;
  readonly confirmedAt?: Date;
  readonly cancelledAt?: Date;
}
