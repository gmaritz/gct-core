"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelCatalogueEntry = createHotelCatalogueEntry;
function createHotelCatalogueEntry(input) {
    const hotelCode = input.hotelCode.trim();
    const destinationCode = input.destinationCode.trim();
    const zoneCode = input.zoneCode.trim();
    const zoneName = input.zoneName.trim();
    if (!hotelCode || !destinationCode || !zoneCode || !zoneName) {
        throw new Error("Catalogue hotel code, destination, zone code and zone name are required.");
    }
    if (!Number.isInteger(input.starGrading) || (input.starGrading !== 4 && input.starGrading !== 5)) {
        throw new Error("Catalogue star grading must be 4 or 5.");
    }
    return Object.freeze({
        hotelCode,
        starGrading: input.starGrading,
        destinationCode,
        zoneCode,
        zoneName,
        active: input.active,
    });
}
//# sourceMappingURL=hotel-catalogue-entry.js.map