"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalReservationPrismaRepository = void 0;
const client_1 = require("@prisma/client");
const aggregate_1 = require("@application/reservations/aggregate");
const prisma_service_1 = require("../prisma/prisma.service");
const BOOKING_STATUS_BY_LIFECYCLE = {
    [aggregate_1.ReservationStatus.CREATED]: "DRAFT",
    [aggregate_1.ReservationStatus.QUOTED]: "PLANNED",
    [aggregate_1.ReservationStatus.CONFIRMED]: "CONFIRMED",
    [aggregate_1.ReservationStatus.AMENDED]: "PLANNED",
    [aggregate_1.ReservationStatus.CANCELLED]: "CANCELLED",
    [aggregate_1.ReservationStatus.COMPLETED]: "COMPLETED",
};
const VALID_LIFECYCLE = new Set(Object.values(aggregate_1.ReservationStatus));
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function expectObject(value, field) {
    if (!isObject(value)) {
        throw new Error(`Reservation reconstruction failed: ${field} is missing or invalid.`);
    }
    return value;
}
function expectArray(value, field) {
    if (!Array.isArray(value)) {
        throw new Error(`Reservation reconstruction failed: ${field} is missing or invalid.`);
    }
    const mapped = [];
    for (const entry of value) {
        if (!isObject(entry)) {
            throw new Error(`Reservation reconstruction failed: ${field} contains invalid entries.`);
        }
        mapped.push(entry);
    }
    return mapped;
}
function parseDate(value, field) {
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
function parseOptionalDate(value) {
    if (typeof value === "undefined" || value === null) {
        return undefined;
    }
    return parseDate(value, "optional date");
}
function parseLifecycle(value) {
    if (!value || !VALID_LIFECYCLE.has(value)) {
        throw new Error("Reservation reconstruction failed: invalid lifecycle value.");
    }
    return value;
}
function toPersistenceJson(reservation) {
    return {
        journeySnapshot: JSON.parse(JSON.stringify(reservation.journeySnapshot)),
        travellerSnapshots: JSON.parse(JSON.stringify(reservation.travellerSnapshots)),
        accommodationSnapshots: JSON.parse(JSON.stringify(reservation.accommodationSnapshots)),
        pricingSnapshot: reservation.pricingSnapshot
            ? JSON.parse(JSON.stringify(reservation.pricingSnapshot))
            : null,
        paymentSnapshot: reservation.paymentSnapshot
            ? JSON.parse(JSON.stringify(reservation.paymentSnapshot))
            : null,
        supplierReferences: JSON.parse(JSON.stringify(reservation.supplierReferences)),
        reservationTimeline: JSON.parse(JSON.stringify(reservation.timeline)),
        reservationMetadata: JSON.parse(JSON.stringify(reservation.metadata)),
    };
}
function toNullableJsonInput(value) {
    return value === null ? client_1.Prisma.DbNull : value;
}
function toDomain(booking) {
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
    return aggregate_1.Reservation.restore({
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
                        childAges: Array.isArray(room.childAges) ? room.childAges.filter((age) => typeof age === "number") : [],
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
            milestone: String(item.milestone ?? ""),
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
function assertPersistenceContext(context) {
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
async function resolveLookupId(prisma, model, code) {
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
function getCanonicalReservationModel(prisma) {
    const reservationModel = prisma.reservation;
    if (!reservationModel) {
        throw new Error("Canonical Reservation persistence model is unavailable; legacy Booking persistence is not authoritative.");
    }
    return reservationModel;
}
function getLegacyBookingModel(prisma) {
    const bookingModel = prisma.booking;
    if (!bookingModel) {
        return null;
    }
    return bookingModel;
}
class CanonicalReservationPrismaRepository {
    async save(reservation, context) {
        assertPersistenceContext(context);
        if (!reservation.pricingSnapshot) {
            throw new Error("Reservation pricing snapshot is required for persistence.");
        }
        const prisma = prisma_service_1.PrismaService.getInstance();
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
            const bookingStatusId = await resolveLookupId(tx, "bookingStatus", statusCode);
            const currencyId = await resolveLookupId(tx, "currency", reservation.pricingSnapshot.currency);
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
                    totalAmount: reservation.pricingSnapshot.totalPrice,
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
                    totalAmount: reservation.pricingSnapshot.totalPrice,
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
    async findById(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
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
    async findByReservationNumber(reservationNumber) {
        const prisma = prisma_service_1.PrismaService.getInstance();
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
    async findByTravellerId(travellerId) {
        const prisma = prisma_service_1.PrismaService.getInstance();
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
    async findByJourneyId(journeyId) {
        const prisma = prisma_service_1.PrismaService.getInstance();
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
    async delete(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        await getCanonicalReservationModel(prisma).delete({ where: { id } });
    }
}
exports.CanonicalReservationPrismaRepository = CanonicalReservationPrismaRepository;
//# sourceMappingURL=canonical-reservation-prisma.repository.js.map