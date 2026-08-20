"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectJourneyAccommodation = selectJourneyAccommodation;
function selectJourneyAccommodation(option, selection) {
    if (option.accommodationId !== selection.accommodationId) {
        throw new Error("Selected accommodation does not belong to the package stop option.");
    }
    if (option.packageStop && selection.packageStopId && option.packageStop.stopId !== selection.packageStopId) {
        throw new Error("Selected accommodation belongs to another package stop.");
    }
    const room = option.roomOptions?.find((candidate) => candidate.reference.provider === selection.roomReference.provider &&
        candidate.reference.opaqueReference === selection.roomReference.opaqueReference);
    if (!room)
        throw new Error("Selected room does not belong to the accommodation option.");
    const rate = room.rateOptions.find((candidate) => candidate.reference.provider === selection.rateReference.provider &&
        candidate.reference.opaqueReference === selection.rateReference.opaqueReference);
    if (!rate)
        throw new Error("Selected rate does not belong to the selected room.");
    if (rate.status !== "BOOKABLE" && rate.status !== "RECHECK_REQUIRED") {
        throw new Error("Selected rate is not available.");
    }
    const provider = rate.reference.provider;
    return Object.freeze({
        ...option,
        selection: Object.freeze(selection),
        pricingInput: Object.freeze({
            packageId: option.packageStop?.packageId,
            packageStopId: option.packageStop?.stopId,
            stopOrder: option.packageStop?.stopOrder,
            accommodation: option.accommodation,
            stayPeriod: option.packageStop
                ? { checkIn: option.packageStop.checkInDate, checkOut: option.packageStop.checkOutDate }
                : undefined,
            accommodationId: option.accommodationId,
            room,
            rate,
            occupancy: option.requestedOccupancy,
        }),
        reservationInput: Object.freeze({
            packageId: option.packageStop?.packageId,
            packageStopId: option.packageStop?.stopId,
            stopOrder: option.packageStop?.stopOrder,
            accommodation: option.accommodation,
            stayPeriod: option.packageStop
                ? { checkIn: option.packageStop.checkInDate, checkOut: option.packageStop.checkOutDate }
                : undefined,
            accommodationId: option.accommodationId,
            room,
            rate,
            occupancy: option.requestedOccupancy,
            provider,
            supplierReference: rate.reference,
        }),
    });
}
//# sourceMappingURL=journey-accommodation.js.map