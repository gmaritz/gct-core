import { ReservationSnapshot } from "./reservation-snapshot";

export interface SupplierReference extends ReservationSnapshot {
  readonly providerId: string;
  readonly supplierBookingReference: string;
  readonly confirmationNumber?: string;
}
