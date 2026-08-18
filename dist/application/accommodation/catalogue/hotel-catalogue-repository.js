"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryHotelCatalogueRepository = void 0;
class InMemoryHotelCatalogueRepository {
    constructor() {
        this.entries = new Map();
    }
    async findActive(filter = {}) {
        const codes = filter.hotelCodes ? new Set(filter.hotelCodes.map((code) => code.trim())) : undefined;
        return Object.freeze([...this.entries.values()]
            .filter((entry) => entry.active)
            .filter((entry) => !codes || codes.has(entry.hotelCode))
            .filter((entry) => !filter.destinationCode || entry.destinationCode === filter.destinationCode.trim())
            .filter((entry) => !filter.zoneCode || entry.zoneCode === filter.zoneCode.trim())
            .filter((entry) => filter.starGrading === undefined || entry.starGrading === filter.starGrading)
            .sort((left, right) => left.zoneName.localeCompare(right.zoneName) || left.hotelCode.localeCompare(right.hotelCode)));
    }
    async upsert(entry) {
        const previous = this.entries.get(entry.hotelCode);
        this.entries.set(entry.hotelCode, Object.freeze({ ...entry }));
        if (!previous)
            return "inserted";
        return JSON.stringify(previous) === JSON.stringify(entry) ? "unchanged" : "updated";
    }
    async deactivateMissing(hotelCodes) {
        const retained = new Set(hotelCodes.map((code) => code.trim()));
        let count = 0;
        for (const [code, entry] of this.entries) {
            if (!retained.has(code) && entry.active) {
                this.entries.set(code, Object.freeze({ ...entry, active: false }));
                count += 1;
            }
        }
        return count;
    }
}
exports.InMemoryHotelCatalogueRepository = InMemoryHotelCatalogueRepository;
//# sourceMappingURL=hotel-catalogue-repository.js.map