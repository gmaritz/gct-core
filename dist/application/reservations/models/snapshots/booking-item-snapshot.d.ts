import { ReservationSnapshot } from "./reservation-snapshot";
export interface SupplierBookingSnapshot extends ReservationSnapshot {
    readonly supplierId?: string;
    readonly supplierProductId?: string;
    readonly supplierReference: string;
    readonly status: string;
    readonly requestedAt?: Date;
    readonly confirmedAt?: Date;
    readonly cancelledAt?: Date;
}
export interface BookingItemSnapshot extends ReservationSnapshot {
    readonly bookingItemId: string;
    readonly bookingId?: string;
    readonly productId?: string;
    readonly fulfilmentType?: string;
    readonly packageStopId?: string;
    readonly stopOrder?: number;
    readonly state?: string;
    readonly supplierBookings?: ReadonlyArray<SupplierBookingSnapshot>;
}
//# sourceMappingURL=booking-item-snapshot.d.ts.map