"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelCatalogueService = void 0;
const hotel_code_validation_1 = require("../discovery/validation/hotel-code-validation");
function normalizeOptionalCode(value) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
}
function normalizeExplicitCodes(codes) {
    if (!codes || codes.length === 0) {
        return Object.freeze([]);
    }
    const seen = new Set();
    const normalized = [];
    codes.forEach((hotelCode, index) => {
        if (!(0, hotel_code_validation_1.isValidExplicitHotelCode)(hotelCode)) {
            throw new Error(`Invalid explicit hotel code at index ${index}.`);
        }
        const code = hotelCode.trim();
        if (!seen.has(code)) {
            seen.add(code);
            normalized.push(code);
        }
    });
    return Object.freeze(normalized);
}
class HotelCatalogueService {
    constructor(repository) {
        this.repository = repository;
    }
    async resolveEntries(criteria) {
        const explicitCodes = normalizeExplicitCodes(criteria.hotelCodes);
        if (explicitCodes.length > 0) {
            const activeEntries = await this.repository.findActive({ hotelCodes: explicitCodes });
            const entriesByCode = new Map(activeEntries.map((entry) => [entry.hotelCode, entry]));
            const orderedEntries = explicitCodes
                .map((hotelCode) => entriesByCode.get(hotelCode))
                .filter((entry) => Boolean(entry));
            return Object.freeze({
                selectionMode: "EXPLICIT",
                entries: Object.freeze(orderedEntries),
            });
        }
        const attributeEntries = await this.repository.findActive({
            destinationCode: normalizeOptionalCode(criteria.destinationCode),
            zoneCode: normalizeOptionalCode(criteria.zoneCode),
            starGrading: criteria.starGrading,
        });
        return Object.freeze({
            selectionMode: "ATTRIBUTE",
            entries: Object.freeze(attributeEntries),
        });
    }
    async select(criteria) {
        const resolved = await this.resolveEntries(criteria);
        return Object.freeze({
            hotelCodes: Object.freeze(resolved.entries.map((entry) => entry.hotelCode)),
            selectionMode: resolved.selectionMode,
        });
    }
    async find(criteria) {
        const resolved = await this.resolveEntries(criteria);
        return Object.freeze(resolved.entries);
    }
}
exports.HotelCatalogueService = HotelCatalogueService;
//# sourceMappingURL=hotel-catalogue-service.js.map