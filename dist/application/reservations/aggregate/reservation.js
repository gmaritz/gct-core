"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = exports.ReservationStatus = void 0;
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["CREATED"] = "CREATED";
    ReservationStatus["QUOTED"] = "QUOTED";
    ReservationStatus["CONFIRMED"] = "CONFIRMED";
    ReservationStatus["AMENDED"] = "AMENDED";
    ReservationStatus["CANCELLED"] = "CANCELLED";
    ReservationStatus["COMPLETED"] = "COMPLETED";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeIdentity(identity) {
    return Object.freeze({ ...identity });
}
function freezeJourneySnapshot(snapshot) {
    return Object.freeze({
        journeyId: snapshot.journeyId,
        title: snapshot.title,
        startDate: typeof snapshot.startDate === "undefined" ? undefined : cloneDate(snapshot.startDate),
        endDate: typeof snapshot.endDate === "undefined" ? undefined : cloneDate(snapshot.endDate),
        summary: snapshot.summary,
    });
}
function freezeTravellerSnapshot(snapshot) {
    return Object.freeze({
        travellerId: snapshot.travellerId,
        fullName: snapshot.fullName,
        email: snapshot.email,
        phone: snapshot.phone,
        dateOfBirth: typeof snapshot.dateOfBirth === "undefined" ? undefined : cloneDate(snapshot.dateOfBirth),
    });
}
function freezeAccommodationSnapshot(snapshot) {
    return Object.freeze({
        accommodationId: snapshot.accommodationId,
        name: snapshot.name,
        checkInDate: typeof snapshot.checkInDate === "undefined" ? undefined : cloneDate(snapshot.checkInDate),
        checkOutDate: typeof snapshot.checkOutDate === "undefined" ? undefined : cloneDate(snapshot.checkOutDate),
        roomType: snapshot.roomType,
    });
}
function freezePricingSnapshot(snapshot) {
    return Object.freeze({ ...snapshot });
}
function freezePaymentSnapshot(snapshot) {
    return Object.freeze({ ...snapshot });
}
function freezeSupplierReference(reference) {
    return Object.freeze({ ...reference });
}
function freezeTimelineEntry(entry) {
    return Object.freeze({
        type: entry.type,
        occurredAt: cloneDate(entry.occurredAt),
        note: entry.note,
    });
}
function freezeMetadata(metadata) {
    return Object.freeze({
        createdAt: cloneDate(metadata.createdAt),
        updatedAt: cloneDate(metadata.updatedAt),
        version: metadata.version,
    });
}
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function ensureInvariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function validateRequiredComposition(composition) {
    ensureInvariant(!isBlank(composition.identity?.id), "Reservation identity is required.");
    ensureInvariant(typeof composition.status === "string", "Reservation status is required.");
    ensureInvariant(!isBlank(composition.journeySnapshot?.journeyId), "Journey snapshot is required.");
    ensureInvariant(Array.isArray(composition.travellerSnapshots) && composition.travellerSnapshots.length > 0, "At least one traveller snapshot is required.");
    ensureInvariant(composition.travellerSnapshots.every((snapshot) => !isBlank(snapshot?.travellerId)), "Traveller snapshots are invalid.");
    ensureInvariant(typeof composition.metadata === "object" && composition.metadata !== null, "Reservation metadata is required.");
    ensureInvariant(!isBlank(composition.metadata.version), "Reservation metadata version is required.");
}
class Reservation {
    constructor(composition) {
        validateRequiredComposition(composition);
        this.identity = freezeIdentity(composition.identity);
        this.status = composition.status;
        this.journeySnapshot = freezeJourneySnapshot(composition.journeySnapshot);
        this.travellerSnapshots = Object.freeze(composition.travellerSnapshots.map(freezeTravellerSnapshot));
        this.accommodationSnapshots = Object.freeze((composition.accommodationSnapshots ?? []).map(freezeAccommodationSnapshot));
        this.pricingSnapshot =
            typeof composition.pricingSnapshot === "undefined"
                ? undefined
                : freezePricingSnapshot(composition.pricingSnapshot);
        this.paymentSnapshot =
            typeof composition.paymentSnapshot === "undefined"
                ? undefined
                : freezePaymentSnapshot(composition.paymentSnapshot);
        this.supplierReferences = Object.freeze((composition.supplierReferences ?? []).map(freezeSupplierReference));
        this.timeline = Object.freeze((composition.timeline ?? []).map(freezeTimelineEntry));
        this.metadata = freezeMetadata(composition.metadata);
        Object.freeze(this);
    }
    static create(composition) {
        return new Reservation(composition);
    }
    static restore(composition) {
        return new Reservation(composition);
    }
}
exports.Reservation = Reservation;
//# sourceMappingURL=reservation.js.map