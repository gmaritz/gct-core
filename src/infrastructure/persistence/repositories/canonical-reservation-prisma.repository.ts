import { Prisma, PrismaClient } from "@prisma/client";

import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import {
  ReservationPersistenceContext,
  ReservationRepository,
} from "@application/reservations/repository";
import { PrismaService } from "../prisma/prisma.service";

const BOOKING_STATUS_BY_LIFECYCLE: Record<ReservationStatus, string> = {
  [ReservationStatus.CREATED]: "DRAFT",
  [ReservationStatus.QUOTED]: "PLANNED",
  [ReservationStatus.CONFIRMED]: "CONFIRMED",
  [ReservationStatus.AMENDED]: "PLANNED",
  [ReservationStatus.CANCELLED]: "CANCELLED",
  [ReservationStatus.COMPLETED]: "COMPLETED",
};

const VALID_LIFECYCLE = new Set<string>(Object.values(ReservationStatus));

type PersistedBooking = {
  id: string;
  bookingNumber: string;
  reservationLifecycleCode: string | null;
  journeySnapshot: Prisma.JsonValue | null;
  travellerSnapshots: Prisma.JsonValue | null;
  accommodationSnapshots: Prisma.JsonValue | null;
  pricingSnapshot: Prisma.JsonValue | null;
  paymentSnapshot: Prisma.JsonValue | null;
  supplierReferences: Prisma.JsonValue | null;
  reservationTimeline: Prisma.JsonValue | null;
  reservationMetadata: Prisma.JsonValue | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function expectObject(value: Prisma.JsonValue | null, field: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(`Reservation reconstruction failed: ${field} is missing or invalid.`);
  }
  return value;
}

function expectArray(value: Prisma.JsonValue | null, field: string): ReadonlyArray<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    throw new Error(`Reservation reconstruction failed: ${field} is missing or invalid.`);
  }

  const mapped: Array<Record<string, unknown>> = [];
  for (const entry of value) {
    if (!isObject(entry)) {
      throw new Error(`Reservation reconstruction failed: ${field} contains invalid entries.`);
    }
    mapped.push(entry);
  }

  return mapped;
}

function parseDate(value: unknown, field: string): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  throw new Error(`Reservation reconstruction failed: ${field} is not a valid date.`);
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }
  return parseDate(value, "optional date");
}

function parseLifecycle(value: string | null): ReservationStatus {
  if (!value || !VALID_LIFECYCLE.has(value)) {
    throw new Error("Reservation reconstruction failed: invalid lifecycle value.");
  }
  return value as ReservationStatus;
}

function toPersistenceJson(reservation: Reservation): {
  journeySnapshot: Prisma.JsonObject;
  travellerSnapshots: Prisma.JsonArray;
  accommodationSnapshots: Prisma.JsonArray;
  pricingSnapshot: Prisma.JsonObject | null;
  paymentSnapshot: Prisma.JsonObject | null;
  supplierReferences: Prisma.JsonArray;
  reservationTimeline: Prisma.JsonArray;
  reservationMetadata: Prisma.JsonObject;
} {
  return {
    journeySnapshot: JSON.parse(JSON.stringify(reservation.journeySnapshot)) as Prisma.JsonObject,
    travellerSnapshots: JSON.parse(JSON.stringify(reservation.travellerSnapshots)) as Prisma.JsonArray,
    accommodationSnapshots: JSON.parse(JSON.stringify(reservation.accommodationSnapshots)) as Prisma.JsonArray,
    pricingSnapshot: reservation.pricingSnapshot
      ? (JSON.parse(JSON.stringify(reservation.pricingSnapshot)) as Prisma.JsonObject)
      : null,
    paymentSnapshot: reservation.paymentSnapshot
      ? (JSON.parse(JSON.stringify(reservation.paymentSnapshot)) as Prisma.JsonObject)
      : null,
    supplierReferences: JSON.parse(JSON.stringify(reservation.supplierReferences)) as Prisma.JsonArray,
    reservationTimeline: JSON.parse(JSON.stringify(reservation.timeline)) as Prisma.JsonArray,
    reservationMetadata: JSON.parse(JSON.stringify(reservation.metadata)) as Prisma.JsonObject,
  };
}

function toNullableJsonInput(
  value: Prisma.JsonObject | null,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  return value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

function toDomain(booking: PersistedBooking): Reservation {
  const lifecycle = parseLifecycle(booking.reservationLifecycleCode);
  const journeySnapshot = expectObject(booking.journeySnapshot, "journeySnapshot");
  const travellerSnapshots = expectArray(booking.travellerSnapshots, "travellerSnapshots");
  const accommodationSnapshots = booking.accommodationSnapshots
    ? expectArray(booking.accommodationSnapshots, "accommodationSnapshots")
    : [];
  const pricingSnapshot = booking.pricingSnapshot
    ? expectObject(booking.pricingSnapshot, "pricingSnapshot")
    : undefined;
  const paymentSnapshot = booking.paymentSnapshot
    ? expectObject(booking.paymentSnapshot, "paymentSnapshot")
    : undefined;
  const supplierReferences = booking.supplierReferences
    ? expectArray(booking.supplierReferences, "supplierReferences")
    : [];
  const timeline = booking.reservationTimeline
    ? expectArray(booking.reservationTimeline, "reservationTimeline")
    : [];
  const metadata = expectObject(booking.reservationMetadata, "reservationMetadata");

  return Reservation.restore({
    identity: { id: booking.id },
    reservationNumber: booking.bookingNumber,
    status: lifecycle,
    journeySnapshot: {
      snapshotId: String(journeySnapshot.snapshotId ?? ""),
      capturedAt: parseDate(journeySnapshot.capturedAt, "journeySnapshot.capturedAt"),
      version: String(journeySnapshot.version ?? ""),
      journeyId: String(journeySnapshot.journeyId ?? ""),
      title: String(journeySnapshot.title ?? ""),
      destination: typeof journeySnapshot.destination === "string" ? journeySnapshot.destination : undefined,
      duration: typeof journeySnapshot.duration === "string" ? journeySnapshot.duration : undefined,
      accommodationSummary: typeof journeySnapshot.accommodationSummary === "string" ? journeySnapshot.accommodationSummary : undefined,
      experienceSummary: typeof journeySnapshot.experienceSummary === "string" ? journeySnapshot.experienceSummary : undefined,
      startDate: parseOptionalDate(journeySnapshot.startDate),
      endDate: parseOptionalDate(journeySnapshot.endDate),
      summary: typeof journeySnapshot.summary === "string" ? journeySnapshot.summary : undefined,
    },
    travellerSnapshots: travellerSnapshots.map((item) => ({
      snapshotId: String(item.snapshotId ?? ""),
      capturedAt: parseDate(item.capturedAt, "travellerSnapshot.capturedAt"),
      version: String(item.version ?? ""),
      travellerId: String(item.travellerId ?? ""),
      fullName: String(item.fullName ?? ""),
      email: typeof item.email === "string" ? item.email : undefined,
      phone: typeof item.phone === "string" ? item.phone : undefined,
      nationality: typeof item.nationality === "string" ? item.nationality : undefined,
      travellerType: typeof item.travellerType === "string" ? item.travellerType : undefined,
      dateOfBirth: parseOptionalDate(item.dateOfBirth),
    })),
    accommodationSnapshots: accommodationSnapshots.map((item) => ({
      snapshotId: String(item.snapshotId ?? ""),
      capturedAt: parseDate(item.capturedAt, "accommodationSnapshot.capturedAt"),
      version: String(item.version ?? ""),
      accommodationId: String(item.accommodationId ?? ""),
      propertyName: String(item.propertyName ?? ""),
      roomType: typeof item.roomType === "string" ? item.roomType : undefined,
      mealBasis: typeof item.mealBasis === "string" ? item.mealBasis : undefined,
      checkInDate: parseOptionalDate(item.checkInDate),
      checkOutDate: parseOptionalDate(item.checkOutDate),
      packageId: typeof item.packageId === "string" ? item.packageId : undefined,
      packageStopId: typeof item.packageStopId === "string" ? item.packageStopId : undefined,
      stopOrder: typeof item.stopOrder === "number" ? item.stopOrder : undefined,
      rateReference: isObject(item.rateReference)
        ? {
            provider: String(item.rateReference.provider ?? ""),
            opaqueReference: String(item.rateReference.opaqueReference ?? ""),
          }
        : undefined,
      roomReference: isObject(item.roomReference)
        ? {
            provider: String(item.roomReference.provider ?? ""),
            opaqueReference: String(item.roomReference.opaqueReference ?? ""),
          }
        : undefined,
      provider: typeof item.provider === "string" ? item.provider : undefined,
      occupancy: isObject(item.occupancy) && Array.isArray(item.occupancy.rooms)
        ? {
            rooms: item.occupancy.rooms.filter(isObject).map((room) => ({
              adults: Number(room.adults ?? 0),
              children: Number(room.children ?? 0),
              childAges: Array.isArray(room.childAges) ? room.childAges.filter((age): age is number => typeof age === "number") : [],
            })),
          }
        : undefined,
      supplierPrice: isObject(item.supplierPrice)
        ? {
            amount: Number(item.supplierPrice.amount ?? 0),
            currency: String(item.supplierPrice.currency ?? ""),
            basis: typeof item.supplierPrice.basis === "string" ? item.supplierPrice.basis : undefined,
          }
        : undefined,
    })),
    pricingSnapshot: pricingSnapshot
      ? {
          snapshotId: String(pricingSnapshot.snapshotId ?? ""),
          capturedAt: parseDate(pricingSnapshot.capturedAt, "pricingSnapshot.capturedAt"),
          version: String(pricingSnapshot.version ?? ""),
          currency: String(pricingSnapshot.currency ?? ""),
          totalPrice: Number(pricingSnapshot.totalPrice ?? 0),
          taxes: Number(pricingSnapshot.taxes ?? 0),
          discounts: Number(pricingSnapshot.discounts ?? 0),
          fees: Number(pricingSnapshot.fees ?? 0),
        }
      : undefined,
    paymentSnapshot: paymentSnapshot
      ? {
          snapshotId: String(paymentSnapshot.snapshotId ?? ""),
          capturedAt: parseDate(paymentSnapshot.capturedAt, "paymentSnapshot.capturedAt"),
          version: String(paymentSnapshot.version ?? ""),
          paymentStatus: String(paymentSnapshot.paymentStatus ?? ""),
          paymentMethod: typeof paymentSnapshot.paymentMethod === "string" ? paymentSnapshot.paymentMethod : undefined,
          amountReceived: Number(paymentSnapshot.amountReceived ?? 0),
          balanceOutstanding: Number(paymentSnapshot.balanceOutstanding ?? 0),
        }
      : undefined,
    supplierReferences: supplierReferences.map((item) => ({
      snapshotId: String(item.snapshotId ?? ""),
      capturedAt: parseDate(item.capturedAt, "supplierReference.capturedAt"),
      version: String(item.version ?? ""),
      providerId: String(item.providerId ?? ""),
      supplierBookingReference: String(item.supplierBookingReference ?? ""),
      confirmationNumber: typeof item.confirmationNumber === "string" ? item.confirmationNumber : undefined,
    })),
    timeline: timeline.map((item) => ({
      snapshotId: String(item.snapshotId ?? ""),
      capturedAt: parseDate(item.capturedAt, "timeline.capturedAt"),
      version: String(item.version ?? ""),
      milestone: String(item.milestone ?? "") as never,
      occurredAt: parseDate(item.occurredAt, "timeline.occurredAt"),
      note: typeof item.note === "string" ? item.note : undefined,
    })),
    metadata: {
      createdAt: parseDate(metadata.createdAt, "metadata.createdAt"),
      updatedAt: parseDate(metadata.updatedAt, "metadata.updatedAt"),
      version: String(metadata.version ?? ""),
    },
  });
}

function assertPersistenceContext(context: ReservationPersistenceContext): void {
  if (!context.customerId?.trim()) {
    throw new Error("Customer ID is required to persist a reservation.");
  }
  if (!(context.bookingStartDate instanceof Date) || Number.isNaN(context.bookingStartDate.getTime())) {
    throw new Error("Booking start date is required to persist a reservation.");
  }
  if (!(context.bookingEndDate instanceof Date) || Number.isNaN(context.bookingEndDate.getTime())) {
    throw new Error("Booking end date is required to persist a reservation.");
  }
  if (context.bookingEndDate.getTime() < context.bookingStartDate.getTime()) {
    throw new Error("Booking end date must be on or after booking start date.");
  }
}

async function resolveLookupId(
  prisma: PrismaClient,
  model: "bookingStatus" | "currency",
  code: string,
): Promise<string> {
  if (model === "bookingStatus") {
    const status = await prisma.bookingStatus.upsert({
      where: { code },
      update: { name: code },
      create: { code, name: code, active: true },
      select: { id: true },
    });
    return status.id;
  }

  const currency = await prisma.currency.upsert({
    where: { code },
    update: { name: code },
    create: { code, name: code, active: true },
    select: { id: true },
  });
  return currency.id;
}

function getCanonicalReservationModel(prisma: PrismaClient): {
  upsert: (args: { where: { id: string }; update: Record<string, unknown>; create: Record<string, unknown> }) => Promise<unknown>;
  findUnique: (args: { where: { id?: string; bookingNumber?: string }; select: Record<string, boolean> }) => Promise<PersistedBooking | null>;
  findMany: (args: { select: Record<string, boolean> }) => Promise<PersistedBooking[]>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
} {
  const reservationModel = (prisma as PrismaClient & { reservation?: any }).reservation;
  if (!reservationModel) {
    throw new Error("Canonical Reservation persistence model is unavailable; legacy Booking persistence is not authoritative.");
  }
  return reservationModel;
}

function getLegacyBookingModel(prisma: PrismaClient): {
  findUnique: (args: { where: { id?: string; bookingNumber?: string }; select: Record<string, boolean> }) => Promise<PersistedBooking | null>;
  findMany: (args: { select: Record<string, boolean> }) => Promise<PersistedBooking[]>;
} {
  const bookingModel = (prisma as PrismaClient & { booking?: any }).booking;
  if (!bookingModel) {
    return null as never;
  }
  return bookingModel;
}

export class CanonicalReservationPrismaRepository implements ReservationRepository {
  public async save(reservation: Reservation, context: ReservationPersistenceContext): Promise<void> {
    assertPersistenceContext(context);

    if (!reservation.pricingSnapshot) {
      throw new Error("Reservation pricing snapshot is required for persistence.");
    }

    const prisma = PrismaService.getInstance() as PrismaClient;
    const reservationModel = getCanonicalReservationModel(prisma);
    const statusCode = BOOKING_STATUS_BY_LIFECYCLE[reservation.status];
    const lifecycleCode = reservation.status;

    if (!VALID_LIFECYCLE.has(lifecycleCode)) {
      throw new Error("Unsupported reservation lifecycle value.");
    }

    const snapshotJson = toPersistenceJson(reservation);

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: context.customerId },
        select: { id: true },
      });

      if (!customer) {
        throw new Error(`Customer ${context.customerId} does not exist.`);
      }

      const bookingStatusId = await resolveLookupId(tx as unknown as PrismaClient, "bookingStatus", statusCode);
      const currencyId = await resolveLookupId(tx as unknown as PrismaClient, "currency", reservation.pricingSnapshot!.currency);

      await reservationModel.upsert({
        where: { id: reservation.identity.id },
        update: {
          customerId: context.customerId,
          bookingNumber: reservation.reservationNumber,
          bookingDate: reservation.metadata.createdAt,
          travelDate: context.bookingStartDate,
          returnDate: context.bookingEndDate,
          bookingStatusId,
          reservationLifecycleCode: lifecycleCode,
          totalAmount: reservation.pricingSnapshot!.totalPrice,
          currencyId,
          journeySnapshot: snapshotJson.journeySnapshot,
          travellerSnapshots: snapshotJson.travellerSnapshots,
          accommodationSnapshots: snapshotJson.accommodationSnapshots,
          pricingSnapshot: toNullableJsonInput(snapshotJson.pricingSnapshot),
          paymentSnapshot: toNullableJsonInput(snapshotJson.paymentSnapshot),
          supplierReferences: snapshotJson.supplierReferences,
          reservationTimeline: snapshotJson.reservationTimeline,
          reservationMetadata: snapshotJson.reservationMetadata,
        },
        create: {
          id: reservation.identity.id,
          customerId: context.customerId,
          bookingNumber: reservation.reservationNumber,
          bookingDate: reservation.metadata.createdAt,
          travelDate: context.bookingStartDate,
          returnDate: context.bookingEndDate,
          bookingStatusId,
          reservationLifecycleCode: lifecycleCode,
          totalAmount: reservation.pricingSnapshot!.totalPrice,
          currencyId,
          journeySnapshot: snapshotJson.journeySnapshot,
          travellerSnapshots: snapshotJson.travellerSnapshots,
          accommodationSnapshots: snapshotJson.accommodationSnapshots,
          pricingSnapshot: toNullableJsonInput(snapshotJson.pricingSnapshot),
          paymentSnapshot: toNullableJsonInput(snapshotJson.paymentSnapshot),
          supplierReferences: snapshotJson.supplierReferences,
          reservationTimeline: snapshotJson.reservationTimeline,
          reservationMetadata: snapshotJson.reservationMetadata,
        },
      });
    });
  }

  public async findById(id: string): Promise<Reservation | null> {
    const prisma = PrismaService.getInstance() as PrismaClient;
    const record = await getCanonicalReservationModel(prisma).findUnique({
      where: { id },
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    if (record) {
      return toDomain(record);
    }

    const legacyBooking = getLegacyBookingModel(prisma);
    if (!legacyBooking) {
      return null;
    }

    const legacyRecord = await legacyBooking.findUnique({
      where: { id },
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    return legacyRecord ? toDomain(legacyRecord) : null;
  }

  public async findByReservationNumber(reservationNumber: string): Promise<Reservation | null> {
    const prisma = PrismaService.getInstance() as PrismaClient;
    const record = await getCanonicalReservationModel(prisma).findUnique({
      where: { bookingNumber: reservationNumber },
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    if (record) {
      return toDomain(record);
    }

    const legacyBooking = getLegacyBookingModel(prisma);
    if (!legacyBooking) {
      return null;
    }

    const legacyRecord = await legacyBooking.findUnique({
      where: { bookingNumber: reservationNumber },
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    return legacyRecord ? toDomain(legacyRecord) : null;
  }

  public async findByTravellerId(travellerId: string): Promise<ReadonlyArray<Reservation>> {
    const prisma = PrismaService.getInstance() as PrismaClient;
    const records = await getCanonicalReservationModel(prisma).findMany({
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    if (records.length > 0) {
      return records
        .filter((record) => {
          if (!Array.isArray(record.travellerSnapshots)) {
            return false;
          }
          return record.travellerSnapshots.some((snapshot) => isObject(snapshot) && snapshot.travellerId === travellerId);
        })
        .map((record) => toDomain(record));
    }

    const legacyBooking = getLegacyBookingModel(prisma);
    if (!legacyBooking) {
      return [];
    }

    const legacyRecords = await legacyBooking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    return legacyRecords
      .filter((record) => Array.isArray(record.travellerSnapshots) && record.travellerSnapshots.some((snapshot) => isObject(snapshot) && snapshot.travellerId === travellerId))
      .map((record) => toDomain(record));
  }

  public async findByJourneyId(journeyId: string): Promise<ReadonlyArray<Reservation>> {
    const prisma = PrismaService.getInstance() as PrismaClient;
    const records = await getCanonicalReservationModel(prisma).findMany({
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    if (records.length > 0) {
      return records
        .filter((record) => isObject(record.journeySnapshot) && record.journeySnapshot.journeyId === journeyId)
        .map((record) => toDomain(record));
    }

    const legacyBooking = getLegacyBookingModel(prisma);
    if (!legacyBooking) {
      return [];
    }

    const legacyRecords = await legacyBooking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        reservationLifecycleCode: true,
        journeySnapshot: true,
        travellerSnapshots: true,
        accommodationSnapshots: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        supplierReferences: true,
        reservationTimeline: true,
        reservationMetadata: true,
      },
    });

    return legacyRecords
      .filter((record) => isObject(record.journeySnapshot) && record.journeySnapshot.journeyId === journeyId)
      .map((record) => toDomain(record));
  }

  public async delete(id: string): Promise<void> {
    const prisma = PrismaService.getInstance() as PrismaClient;
    await getCanonicalReservationModel(prisma).delete({ where: { id } });
  }
}
