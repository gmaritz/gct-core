import { Reservation, ReservationStatus } from "./reservation";

describe("Reservation fulfilment ownership", () => {
  it("preserves BookingItems and their SupplierBookings in the aggregate", (): void => {
    const reservation = Reservation.create({
      identity: { id: "reservation-fulfilment-001" },
      reservationNumber: "RES-FULFIL-001",
      status: ReservationStatus.CREATED,
      journeySnapshot: {
        snapshotId: "journey-snapshot-001",
        capturedAt: new Date("2026-08-28T00:00:00.000Z"),
        version: "1.0.0",
        journeyId: "journey-001",
        title: "Cape Journey",
      },
      travellerSnapshots: [{
        snapshotId: "traveller-snapshot-001",
        capturedAt: new Date("2026-08-28T00:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-001",
        fullName: "Ava Cape",
      }],
      bookingItems: [{
        snapshotId: "booking-item-snapshot-001",
        capturedAt: new Date("2026-08-28T00:00:00.000Z"),
        version: "1.0.0",
        bookingItemId: "booking-item-001",
        bookingId: "booking-001",
        productId: "product-001",
        fulfilmentType: "SUPPLIER",
        supplierBookings: [{
          snapshotId: "supplier-booking-snapshot-001",
          capturedAt: new Date("2026-08-28T00:00:00.000Z"),
          version: "1.0.0",
          supplierId: "supplier-001",
          supplierReference: "supplier-reference-001",
          status: "CONFIRMED",
        }],
      }],
      metadata: {
        createdAt: new Date("2026-08-28T00:00:00.000Z"),
        updatedAt: new Date("2026-08-28T00:00:00.000Z"),
        version: "1.0.0",
      },
    });

    expect(reservation.bookingItems).toHaveLength(1);
    expect(reservation.bookingItems[0]?.supplierBookings).toHaveLength(1);
    expect(reservation.bookingItems[0]?.supplierBookings?.[0]?.supplierReference).toBe("supplier-reference-001");
    expect(Object.isFrozen(reservation.bookingItems)).toBe(true);
    expect(Object.isFrozen(reservation.bookingItems[0]?.supplierBookings)).toBe(true);
  });
});
