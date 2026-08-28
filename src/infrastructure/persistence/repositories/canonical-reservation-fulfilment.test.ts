import { PrismaClient } from "@prisma/client";
import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { CanonicalReservationPrismaRepository } from "./canonical-reservation-prisma.repository";

function createReservation(): Reservation {
  return Reservation.create({
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
      supplierBookings: [{
        snapshotId: "supplier-booking-snapshot-001",
        capturedAt: new Date("2026-08-28T00:00:00.000Z"),
        version: "1.0.0",
        supplierId: "supplier-001",
        supplierReference: "SUP-001",
        status: "CONFIRMED",
      }],
    }],
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-001",
      capturedAt: new Date("2026-08-28T00:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 1000,
      taxes: 0,
      discounts: 0,
      fees: 0,
    },
    paymentSnapshot: {
      snapshotId: "payment-snapshot-001",
      capturedAt: new Date("2026-08-28T00:00:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PENDING",
      amountReceived: 0,
      balanceOutstanding: 1000,
    },
    metadata: {
      createdAt: new Date("2026-08-28T00:00:00.000Z"),
      updatedAt: new Date("2026-08-28T00:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

describe("Canonical Reservation fulfilment persistence", () => {
  it("persists and reconstructs BookingItems and SupplierBookings", async (): Promise<void> => {
    const reservation = createReservation();
    let persisted: Record<string, unknown> | undefined;
    const bookingItems: Array<Record<string, unknown>> = [];
    const supplierBookings: Array<Record<string, unknown>> = [];
    const prisma = {
      $transaction: async (callback: (transaction: unknown) => Promise<void>): Promise<void> => callback(prisma),
      customer: { findUnique: async (): Promise<{ id: string }> => ({ id: "customer-001" }) },
      reservation: {
        upsert: async ({ create }: { create: Record<string, unknown> }): Promise<void> => { persisted = { ...create }; },
        findUnique: async (): Promise<Record<string, unknown> | null> => persisted ? { ...persisted, bookingItems: bookingItems.map((item) => ({ ...item, supplierBookings: supplierBookings.filter((supplier) => supplier.bookingItemId === item.id) })) } : null,
        findMany: async (): Promise<ReadonlyArray<Record<string, unknown>>> => [],
        delete: async (): Promise<void> => undefined,
      },
      bookingItem: {
        deleteMany: async (): Promise<void> => undefined,
        create: async ({ data }: { data: Record<string, unknown> }): Promise<void> => { bookingItems.push(data); },
      },
      supplierBooking: {
        create: async ({ data }: { data: Record<string, unknown> }): Promise<void> => { supplierBookings.push(data); },
      },
      booking: {
        findUnique: async (): Promise<null> => null,
        findMany: async (): Promise<ReadonlyArray<Record<string, unknown>>> => [],
      },
    };
    const repository = new CanonicalReservationPrismaRepository(prisma as unknown as PrismaClient);

    await repository.save(reservation, {
      customerId: "customer-001",
      bookingStartDate: new Date("2026-09-01"),
      bookingEndDate: new Date("2026-09-04"),
    });
    const restored = await repository.findById(reservation.identity.id);

    expect(bookingItems).toHaveLength(1);
    expect(supplierBookings).toHaveLength(1);
    expect(restored?.bookingItems).toHaveLength(1);
    expect(restored?.bookingItems[0]?.supplierBookings?.[0]?.supplierReference).toBe("SUP-001");
  });
});
