import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationTimelineMilestone } from "@application/reservations/models";
import { ReservationPersistenceContext } from "@application/reservations/repository";
import { PrismaClient } from "@prisma/client";

import { CanonicalReservationPrismaRepository } from "./canonical-reservation-prisma.repository";

type JsonRecord = Record<string, unknown>;

type StoredBooking = {
  id: string;
  customerId: string;
  reservationNumber: string;
  bookingNumber: string;
  bookingDate: Date;
  travelDate: Date;
  returnDate: Date;
  bookingStatusId: string;
  reservationLifecycleCode: string | null;
  totalAmount: number;
  currencyId: string;
  journeySnapshot: JsonRecord | null;
  travellerSnapshots: Array<JsonRecord> | null;
  accommodationSnapshots: Array<JsonRecord> | null;
  pricingSnapshot: JsonRecord | null;
  paymentSnapshot: JsonRecord | null;
  supplierReferences: Array<JsonRecord> | null;
  reservationTimeline: Array<JsonRecord> | null;
  reservationMetadata: JsonRecord | null;
  bookingId?: string | null;
  bookingItemId?: string | null;
  supplierId?: string | null;
  reservationReference?: string | null;
  reservationStatusId?: string | null;
  reservedAt?: Date | null;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
};

function createReservation(status: ReservationStatus = ReservationStatus.CREATED, id = "reservation-001", number = "RES-123456-ABCD"): Reservation {
  return Reservation.create({
    identity: { id },
    reservationNumber: number,
    status,
    journeySnapshot: {
      snapshotId: "journey-snap-001",
      capturedAt: new Date("2026-08-22T10:00:00.000Z"),
      version: "1.0.0",
      journeyId: "journey-1001",
      title: "Cape Signature",
      destination: "Cape Town",
      duration: "4 days",
      accommodationSummary: "Boutique stay",
      experienceSummary: "Wine route",
      startDate: new Date("2026-09-10T00:00:00.000Z"),
      endDate: new Date("2026-09-14T00:00:00.000Z"),
      summary: "Sample summary",
    },
    travellerSnapshots: [
      {
        snapshotId: "traveller-snap-001",
        capturedAt: new Date("2026-08-22T10:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-001",
        fullName: "Ari Jacobs",
        email: "ari@example.com",
      },
      {
        snapshotId: "traveller-snap-002",
        capturedAt: new Date("2026-08-22T10:01:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-002",
        fullName: "Mika Jacobs",
      },
    ],
    accommodationSnapshots: [
      {
        snapshotId: "accommodation-snap-001",
        capturedAt: new Date("2026-08-22T10:00:00.000Z"),
        version: "1.0.0",
        accommodationId: "acc-001",
        propertyName: "Harbour View",
        roomType: "Suite",
        checkInDate: new Date("2026-09-10T00:00:00.000Z"),
        checkOutDate: new Date("2026-09-12T00:00:00.000Z"),
        packageId: "package-001",
        packageStopId: "stop-001",
        stopOrder: 1,
        rateReference: { provider: "supplier-a", opaqueReference: "rate-1" },
        roomReference: { provider: "supplier-a", opaqueReference: "room-1" },
        provider: "supplier-a",
        occupancy: {
          rooms: [
            { adults: 2, children: 1, childAges: [8] },
            { adults: 2, children: 0, childAges: [] },
          ],
        },
        supplierPrice: { amount: 23000, currency: "ZAR", basis: "TOTAL_STAY" },
      },
    ],
    pricingSnapshot: {
      snapshotId: "pricing-snap-001",
      capturedAt: new Date("2026-08-22T10:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 46000,
      taxes: 6000,
      discounts: 500,
      fees: 250,
    },
    paymentSnapshot: {
      snapshotId: "payment-snap-001",
      capturedAt: new Date("2026-08-22T10:00:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PENDING",
      amountReceived: 10000,
      balanceOutstanding: 36000,
    },
    supplierReferences: [
      {
        snapshotId: "supplier-snap-001",
        capturedAt: new Date("2026-08-22T10:00:00.000Z"),
        version: "1.0.0",
        providerId: "supplier-a",
        supplierBookingReference: "SB-001",
        bookingId: "booking-001",
        bookingItemId: "booking-item-001",
        supplierId: "supplier-001",
        reservationReference: "SUP-RES-001",
        reservationStatusId: "supplier-confirmed",
        reservedAt: new Date("2026-08-22T10:02:00.000Z"),
        confirmedAt: new Date("2026-08-22T10:03:00.000Z"),
      },
    ],
    timeline: [
      {
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-22T10:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: new Date("2026-08-22T10:00:00.000Z"),
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-22T10:00:00.000Z"),
      updatedAt: new Date("2026-08-22T10:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

function createContext(): ReservationPersistenceContext {
  return {
    customerId: "customer-001",
    bookingStartDate: new Date("2026-09-10T00:00:00.000Z"),
    bookingEndDate: new Date("2026-09-14T00:00:00.000Z"),
  };
}

function createPrismaMock(): {
  prisma: {
    $transaction: (callback: (tx: unknown) => Promise<void>) => Promise<void>;
    $disconnect: () => Promise<void>;
    customer: { findUnique: (input: { where: { id: string }; select: { id: boolean } }) => Promise<{ id: string } | null> };
    bookingStatus: { upsert: (input: { where: { code: string }; update: { name: string }; create: { code: string; name: string; active: boolean }; select: { id: boolean } }) => Promise<{ id: string }> };
    currency: { upsert: (input: { where: { code: string }; update: { name: string }; create: { code: string; name: string; active: boolean }; select: { id: boolean } }) => Promise<{ id: string }> };
    booking: {
      upsert: (input: { where: { id: string }; update: StoredBooking; create: StoredBooking }) => Promise<void>;
      findUnique: (input: { where: { id?: string; bookingNumber?: string }; select: Record<string, boolean> }) => Promise<StoredBooking | null>;
      findMany: (input: { select: Record<string, boolean> }) => Promise<StoredBooking[]>;
      delete: (input: { where: { id: string } }) => Promise<void>;
    };
    reservation: {
      upsert: (input: { where: { id: string }; update: StoredBooking; create: StoredBooking }) => Promise<void>;
      findUnique: (input: { where: { id?: string; reservationNumber?: string }; select: Record<string, boolean> }) => Promise<StoredBooking | null>;
      findMany: (input: { select: Record<string, boolean> }) => Promise<StoredBooking[]>;
      delete: (input: { where: { id: string } }) => Promise<void>;
    };
  };
  bookingStore: Map<string, StoredBooking>;
  reservationStore: Map<string, StoredBooking>;
  customers: Set<string>;
  throwOnUpsert: () => void;
} {
  const bookingStore = new Map<string, StoredBooking>();
  const reservationStore = new Map<string, StoredBooking>();
  const bookingByNumber = new Map<string, string>();
  const reservationByNumber = new Map<string, string>();
  const customers = new Set<string>(["customer-001"]);
  const bookingStatuses = new Map<string, string>();
  const currencies = new Map<string, string>();
  let throwUpsert = false;

  const prisma = {
    $transaction: async (callback: (tx: unknown) => Promise<void>): Promise<void> => {
      await callback(prisma);
    },
    $disconnect: async (): Promise<void> => {
      // No-op for in-memory mock lifecycle.
    },
    customer: {
      findUnique: async ({ where }: { where: { id: string } }): Promise<{ id: string } | null> => {
        return customers.has(where.id) ? { id: where.id } : null;
      },
    },
    bookingStatus: {
      upsert: async ({ where }: { where: { code: string } }): Promise<{ id: string }> => {
        if (!bookingStatuses.has(where.code)) {
          bookingStatuses.set(where.code, `booking-status-${where.code}`);
        }
        return { id: bookingStatuses.get(where.code)! };
      },
    },
    currency: {
      upsert: async ({ where }: { where: { code: string } }): Promise<{ id: string }> => {
        if (!currencies.has(where.code)) {
          currencies.set(where.code, `currency-${where.code}`);
        }
        return { id: currencies.get(where.code)! };
      },
    },
    booking: {
      upsert: async ({ where, update, create }: { where: { id: string }; update: StoredBooking; create: StoredBooking }): Promise<void> => {
        if (throwUpsert) {
          throw new Error("Simulated upsert failure");
        }
        const existingId = bookingByNumber.get(update.bookingNumber);
        if (existingId && existingId !== where.id) {
          throw new Error("Unique constraint failed on bookingNumber");
        }

        const payload = bookingStore.has(where.id) ? update : create;
        bookingStore.set(where.id, payload);
        bookingByNumber.set(payload.bookingNumber, where.id);
      },
      findUnique: async ({ where }: { where: { id?: string; bookingNumber?: string } }): Promise<StoredBooking | null> => {
        if (where.id) {
          return bookingStore.get(where.id) ?? null;
        }
        if (where.bookingNumber) {
          const id = bookingByNumber.get(where.bookingNumber);
          return id ? bookingStore.get(id) ?? null : null;
        }
        return null;
      },
      findMany: async (): Promise<StoredBooking[]> => {
        return [...bookingStore.values()];
      },
      delete: async ({ where }: { where: { id: string } }): Promise<void> => {
        const existing = bookingStore.get(where.id);
        if (existing) {
          bookingByNumber.delete(existing.bookingNumber);
        }
        bookingStore.delete(where.id);
      },
    },
    reservation: {
      upsert: async ({ where, update, create }: { where: { id: string }; update: StoredBooking; create: StoredBooking }): Promise<void> => {
        if (throwUpsert) {
          throw new Error("Simulated upsert failure");
        }
        const existingId = reservationByNumber.get(update.reservationNumber);
        if (existingId && existingId !== where.id) {
          throw new Error("Unique constraint failed on reservationNumber");
        }

        const payload = reservationStore.has(where.id) ? update : create;
        reservationStore.set(where.id, payload);
        reservationByNumber.set(payload.reservationNumber!, where.id);
      },
      findUnique: async ({ where }: { where: { id?: string; reservationNumber?: string } }): Promise<StoredBooking | null> => {
        if (where.id) {
          return reservationStore.get(where.id) ?? null;
        }
        if (where.reservationNumber) {
          const id = reservationByNumber.get(where.reservationNumber);
          return id ? reservationStore.get(id) ?? null : null;
        }
        return null;
      },
      findMany: async (): Promise<StoredBooking[]> => {
        return [...reservationStore.values()];
      },
      delete: async ({ where }: { where: { id: string } }): Promise<void> => {
        const existing = reservationStore.get(where.id);
        if (existing?.reservationNumber) {
          reservationByNumber.delete(existing.reservationNumber);
        }
        reservationStore.delete(where.id);
      },
    },
  };

  return {
    prisma,
    bookingStore,
    reservationStore,
    customers,
    throwOnUpsert: () => {
      throwUpsert = true;
    },
  };
}

describe("CanonicalReservationPrismaRepository", () => {
  it("persists canonical reservation state through the Reservation root", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    const reservation = createReservation();
    await repository.save(reservation, createContext());

    expect(mock.reservationStore.size).toBe(1);
    expect(mock.bookingStore.size).toBe(0);
    expect(mock.reservationStore.get(reservation.identity.id)?.reservationNumber).toBe("RES-123456-ABCD");
  });

  it("persists and reconstructs a canonical reservation round-trip", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    const reservation = createReservation();
    await repository.save(reservation, createContext());

    const restored = await repository.findById(reservation.identity.id);

    expect(restored).not.toBeNull();
    expect(restored?.identity.id).toBe(reservation.identity.id);
    expect(restored?.reservationNumber).toBe("RES-123456-ABCD");
    expect(restored?.status).toBe(ReservationStatus.CREATED);
    expect(restored?.travellerSnapshots.map((item) => item.travellerId)).toEqual(["traveller-001", "traveller-002"]);
    expect(restored?.journeySnapshot.journeyId).toBe("journey-1001");
    expect(restored?.accommodationSnapshots[0]?.occupancy?.rooms[0]?.childAges).toEqual([8]);
    expect(restored?.supplierReferences[0]?.providerId).toBe("supplier-a");
    expect(restored?.supplierReferences[0]?.bookingId).toBe("booking-001");
    expect(restored?.supplierReferences[0]?.bookingItemId).toBe("booking-item-001");
    expect(restored?.supplierReferences[0]?.supplierId).toBe("supplier-001");
    expect(restored?.supplierReferences[0]?.reservationReference).toBe("SUP-RES-001");
    expect(restored?.supplierReferences[0]?.reservationStatusId).toBe("supplier-confirmed");
    expect(restored?.supplierReferences[0]?.confirmedAt?.toISOString()).toBe("2026-08-22T10:03:00.000Z");
    expect(restored?.pricingSnapshot?.currency).toBe("ZAR");
    expect(restored?.timeline[0]?.milestone).toBe(ReservationTimelineMilestone.CREATED);
    expect(restored?.metadata.version).toBe("1.0.0");
  });

  it("reads legacy Booking state only when no canonical Reservation exists", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    const reservation = createReservation();
    await repository.save(reservation, createContext());
    const persisted = mock.reservationStore.get(reservation.identity.id);

    if (!persisted) {
      throw new Error("Missing canonical reservation in test setup");
    }

    mock.reservationStore.clear();
    mock.bookingStore.set(reservation.identity.id, {
      ...persisted,
      reservationNumber: undefined as never,
      bookingNumber: persisted.reservationNumber,
    });

    const restored = await repository.findById(reservation.identity.id);

    expect(restored?.reservationNumber).toBe(reservation.reservationNumber);
    expect(mock.reservationStore.size).toBe(0);
  });

  it("reconciles retained supplier fulfilment columns into the canonical Reservation", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);
    const reservation = createReservation();

    await repository.save(reservation, createContext());
    const persisted = mock.reservationStore.get(reservation.identity.id);
    if (!persisted) {
      throw new Error("Missing canonical reservation in test setup");
    }

    persisted.supplierReferences = null;
    persisted.bookingId = "booking-legacy-001";
    persisted.bookingItemId = "booking-item-legacy-001";
    persisted.supplierId = "supplier-legacy-001";
    persisted.reservationReference = "SUP-LEGACY-001";
    persisted.reservationStatusId = "supplier-confirmed";
    persisted.reservedAt = new Date("2026-08-22T10:02:00.000Z");
    persisted.confirmedAt = new Date("2026-08-22T10:03:00.000Z");
    persisted.cancelledAt = null;

    const restored = await repository.findById(reservation.identity.id);
    const supplierFulfilment = restored?.supplierReferences[0];

    expect(supplierFulfilment?.bookingId).toBe("booking-legacy-001");
    expect(supplierFulfilment?.bookingItemId).toBe("booking-item-legacy-001");
    expect(supplierFulfilment?.supplierId).toBe("supplier-legacy-001");
    expect(supplierFulfilment?.reservationReference).toBe("SUP-LEGACY-001");
    expect(supplierFulfilment?.reservationStatusId).toBe("supplier-confirmed");
    expect(supplierFulfilment?.confirmedAt?.toISOString()).toBe("2026-08-22T10:03:00.000Z");
    expect(restored?.identity.id).toBe(reservation.identity.id);
    expect(mock.bookingStore.size).toBe(0);
  });

  it("preserves all six canonical lifecycle values", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    const states: ReservationStatus[] = [
      ReservationStatus.CREATED,
      ReservationStatus.QUOTED,
      ReservationStatus.CONFIRMED,
      ReservationStatus.AMENDED,
      ReservationStatus.CANCELLED,
      ReservationStatus.COMPLETED,
    ];

    for (const state of states) {
      const reservation = createReservation(state, `reservation-${state.toLowerCase()}`, `RES-${state.slice(0, 3)}-0001`);
      await repository.save(reservation, createContext());
      const restored = await repository.findById(reservation.identity.id);
      expect(restored?.status).toBe(state);
    }
  });

  it("retrieves by reservation number and filters by traveller and journey", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    const reservationA = createReservation(ReservationStatus.CREATED, "reservation-a", "RES-A-0001");
    const reservationB = createReservation(ReservationStatus.CONFIRMED, "reservation-b", "RES-B-0001");

    await repository.save(reservationA, createContext());
    await repository.save(reservationB, createContext());

    const byNumber = await repository.findByReservationNumber("RES-A-0001");
    const byTraveller = await repository.findByTravellerId("traveller-001");
    const byJourney = await repository.findByJourneyId("journey-1001");

    expect(byNumber?.identity.id).toBe("reservation-a");
    expect(byTraveller).toHaveLength(2);
    expect(byJourney).toHaveLength(2);
  });

  it("fails when required persistence context is missing or invalid", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);
    const reservation = createReservation();

    await expect(repository.save(reservation, {
      customerId: "",
      bookingStartDate: new Date("2026-09-10T00:00:00.000Z"),
      bookingEndDate: new Date("2026-09-14T00:00:00.000Z"),
    })).rejects.toThrow("Customer ID is required to persist a reservation.");

    await expect(repository.save(reservation, {
      customerId: "customer-001",
      bookingStartDate: new Date("2026-09-14T00:00:00.000Z"),
      bookingEndDate: new Date("2026-09-10T00:00:00.000Z"),
    })).rejects.toThrow("Booking end date must be on or after booking start date.");
  });

  it("fails closed for invalid lifecycle reconstruction", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    const reservation = createReservation();
    await repository.save(reservation, createContext());

    const existing = mock.reservationStore.get(reservation.identity.id);
    if (!existing) {
      throw new Error("Missing reservation in test setup");
    }
    existing.reservationLifecycleCode = "NOT_A_VALID_STATE";

    await expect(repository.findById(reservation.identity.id)).rejects.toThrow(
      "Reservation reconstruction failed: invalid lifecycle value.",
    );
  });

  it("fails on reservation-number uniqueness conflicts", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    await repository.save(createReservation(ReservationStatus.CREATED, "reservation-a", "RES-CONFLICT-0001"), createContext());

    await expect(
      repository.save(createReservation(ReservationStatus.CREATED, "reservation-b", "RES-CONFLICT-0001"), createContext()),
    ).rejects.toThrow("Unique constraint failed on reservationNumber");
  });

  it("keeps transactional boundary when persistence fails", async () => {
    const mock = createPrismaMock();
    const repository = new CanonicalReservationPrismaRepository(mock.prisma as unknown as PrismaClient);

    mock.throwOnUpsert();

    await expect(repository.save(createReservation(), createContext())).rejects.toThrow("Simulated upsert failure");
    expect(mock.bookingStore.size).toBe(0);
  });
});
