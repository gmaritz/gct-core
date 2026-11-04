"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccommodationReservationSnapshots = createAccommodationReservationSnapshots;
exports.createAccommodationBookingRequests = createAccommodationBookingRequests;
exports.createAccommodationReservationHandoff = createAccommodationReservationHandoff;
function matchingReservationInput(input, pricing) {
    const result = input.reservationInputs.find((candidate) => candidate.packageStopId === pricing.packageStopId);
    if (!result)
        throw new Error(`Missing reservation input for package stop ${pricing.packageStopId}.`);
    return result;
}
function validateOccupancy(occupancy) {
    if (!occupancy || occupancy.rooms.length === 0)
        throw new Error("Accommodation reservation occupancy is required.");
    if (occupancy.rooms.some((room) => !Number.isSafeInteger(room.adults)
        || room.adults < 1
        || !Number.isSafeInteger(room.children)
        || room.children < 0
        || room.children !== room.childAges.length
        || room.childAges.some((age) => !Number.isSafeInteger(age) || age < 0))) {
        throw new Error("Accommodation reservation occupancy is invalid.");
    }
}
function validateRoomRates(roomRates, occupancy) {
    if (roomRates.length !== occupancy.rooms.length) {
        throw new Error("Every requested room slot must retain one selected room and rate.");
    }
    const seenRates = new Set();
    const currency = roomRates[0]?.rate.pricing.currency;
    roomRates.forEach(({ roomSlotId, room, rate }, index) => {
        const requested = occupancy.rooms[index];
        const offered = rate.occupancy.rooms[0];
        const reference = JSON.stringify([rate.reference.provider, rate.reference.opaqueReference]);
        if (!room.reference.opaqueReference.trim()
            || !room.reference.provider.trim()
            || !rate.reference.opaqueReference.trim()
            || !rate.reference.provider.trim()
            || room.reference.provider !== rate.reference.provider
            || !Number.isFinite(rate.pricing.amount)
            || rate.pricing.amount <= 0
            || !/^[A-Z]{3}$/.test(rate.pricing.currency)
            || rate.pricing.currency !== currency) {
            throw new Error("Selected room rate supplier details are invalid or use incompatible currencies.");
        }
        if (seenRates.has(reference))
            throw new Error("A supplier rate cannot be reused across room slots.");
        seenRates.add(reference);
        if (!requested || rate.occupancy.rooms.length !== 1
            || (requested.slotId && roomSlotId !== requested.slotId)
            || !offered
            || offered.adults !== requested.adults
            || offered.children !== requested.children
            || offered.childAges.length !== requested.childAges.length
            || offered.childAges.some((age, ageIndex) => age !== requested.childAges[ageIndex])) {
            throw new Error("Selected room rate occupancy does not match its requested room slot.");
        }
    });
}
function createAccommodationReservationSnapshots(input) {
    if (!input.packageId.trim())
        throw new Error("Package identity is required for reservation handoff.");
    if (input.pricingInputs.length === 0)
        throw new Error("At least one accommodation pricing input is required.");
    const seenStops = new Set();
    return Object.freeze(input.pricingInputs.map((pricing) => {
        const stopId = pricing.packageStopId?.trim();
        if (!stopId || seenStops.has(stopId))
            throw new Error("Accommodation pricing inputs must have unique package stops.");
        seenStops.add(stopId);
        const occupancy = pricing.occupancy ?? pricing.rate.occupancy;
        validateOccupancy(occupancy);
        if (!Number.isFinite(pricing.rate.pricing.amount) || pricing.rate.pricing.amount <= 0) {
            throw new Error("Accommodation reservation requires a positive supplier price.");
        }
        const reservation = matchingReservationInput(input, pricing);
        const roomRates = pricing.roomRates ?? [{ room: pricing.room, rate: pricing.rate }];
        validateRoomRates(roomRates, occupancy);
        return Object.freeze({
            snapshotId: `accommodation-${input.packageId}-${stopId}`,
            capturedAt: new Date(),
            version: "1.0.0",
            accommodationId: pricing.accommodationId,
            propertyName: pricing.accommodation?.identity.name ?? pricing.accommodationId,
            roomType: roomRates.map(({ room }) => room.name).join(", "),
            checkInDate: pricing.stayPeriod?.checkIn,
            checkOutDate: pricing.stayPeriod?.checkOut,
            packageId: pricing.packageId ?? input.packageId,
            packageStopId: stopId,
            stopOrder: pricing.stopOrder,
            rateReference: Object.freeze({ ...pricing.rate.reference }),
            roomReference: Object.freeze({ ...pricing.room.reference }),
            provider: reservation.provider,
            occupancy: pricing.occupancy ?? pricing.rate.occupancy,
            supplierPrice: Object.freeze({
                amount: pricing.rate.pricing.amount,
                currency: pricing.rate.pricing.currency,
                basis: pricing.rate.pricing.basis,
            }),
            selectedRooms: Object.freeze(roomRates.map(({ room, rate, roomSlotId }) => Object.freeze({
                roomSlotId,
                roomType: room.name,
                roomReference: Object.freeze({ ...room.reference }),
                rateReference: Object.freeze({ ...rate.reference }),
                supplierPrice: Object.freeze({ ...rate.pricing }),
                occupancy: rate.occupancy.rooms.length === 1 ? Object.freeze({
                    ...rate.occupancy.rooms[0],
                    childAges: Object.freeze([...rate.occupancy.rooms[0].childAges]),
                }) : undefined,
            }))),
        });
    }));
}
function createAccommodationBookingRequests(input) {
    const snapshots = createAccommodationReservationSnapshots(input);
    return Object.freeze(input.pricingInputs.flatMap((pricing, index) => {
        const reservation = matchingReservationInput(input, pricing);
        const roomRates = pricing.roomRates ?? [{ room: reservation.room, rate: reservation.rate }];
        const occupancy = pricing.occupancy ?? pricing.rate.occupancy;
        validateOccupancy(occupancy);
        validateRoomRates(roomRates, occupancy);
        const stayPeriod = pricing.stayPeriod
            ?? (() => { throw new Error("Selected stay period is required for booking handoff."); })();
        const accommodation = pricing.accommodation
            ?? (() => { throw new Error("Selected accommodation is required for booking handoff."); })();
        return roomRates.map(({ room, rate }, roomIndex) => {
            const roomOccupancy = occupancy.rooms[roomIndex];
            if (!roomOccupancy)
                throw new Error("Selected room occupancy is missing.");
            const roomGuests = input.guests
                .filter((guest) => (!guest.packageStopId || guest.packageStopId === pricing.packageStopId) && guest.roomIndex === roomIndex)
                .map(({ packageStopId: _packageStopId, ...guest }) => Object.freeze({ ...guest, roomIndex: 0 }));
            return Object.freeze({
                accommodation,
                room,
                rate,
                providerReference: rate.reference,
                stayPeriod,
                occupancy: Object.freeze({ rooms: Object.freeze([roomOccupancy]) }),
                holder: input.holder,
                guests: Object.freeze(roomGuests),
                packageStopId: pricing.packageStopId,
                idempotencyKey: pricing.roomRates
                    ? `${input.idempotencyKey}-${snapshots[index]?.packageStopId ?? index}-room-${roomIndex + 1}`
                    : `${input.idempotencyKey}-${snapshots[index]?.packageStopId ?? index}`,
            });
        });
    }));
}
function createAccommodationReservationHandoff(input) {
    if (!Number.isFinite(input.finalPackagePrice.amount) || input.finalPackagePrice.amount < 0) {
        throw new Error("Final package price is invalid.");
    }
    return Object.freeze({
        accommodationSnapshots: createAccommodationReservationSnapshots(input),
        finalPackagePrice: Object.freeze({ ...input.finalPackagePrice }),
        bookingRequests: createAccommodationBookingRequests(input),
    });
}
//# sourceMappingURL=accommodation-reservation-handoff.js.map