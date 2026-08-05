"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsFacility = mapHotelbedsFacility;
exports.mapHotelbedsFacilities = mapHotelbedsFacilities;
function mapHotelbedsFacility(facility) {
    return String(facility.facilityName ?? facility.facilityCode ?? "");
}
function mapHotelbedsFacilities(facilities = []) {
    return facilities.map(mapHotelbedsFacility);
}
//# sourceMappingURL=facility.mapper.js.map