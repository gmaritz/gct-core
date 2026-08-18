"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelCatalogueService = void 0;
class HotelCatalogueService {
    constructor(repository) {
        this.repository = repository;
    }
    async select(criteria) {
        const explicitCodes = (criteria.hotelCodes ?? []).map((code) => code.trim()).filter(Boolean);
        const entries = await this.repository.findActive(explicitCodes.length > 0
            ? { hotelCodes: explicitCodes, destinationCode: criteria.destinationCode, zoneCode: criteria.zoneCode, starGrading: criteria.starGrading }
            : { destinationCode: criteria.destinationCode, zoneCode: criteria.zoneCode, starGrading: criteria.starGrading });
        return Object.freeze({
            hotelCodes: Object.freeze(entries.map((entry) => entry.hotelCode)),
            selectionMode: explicitCodes.length > 0 ? "EXPLICIT" : "ATTRIBUTE",
        });
    }
    async find(criteria) {
        const selection = await this.select(criteria);
        return this.repository.findActive({ hotelCodes: selection.hotelCodes });
    }
}
exports.HotelCatalogueService = HotelCatalogueService;
//# sourceMappingURL=hotel-catalogue-service.js.map