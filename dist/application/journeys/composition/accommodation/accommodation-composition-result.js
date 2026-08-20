"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccommodationCompositionResult = createAccommodationCompositionResult;
function createAccommodationCompositionResult(accommodations) {
    return Object.freeze(accommodations.map((accommodation) => Object.freeze({ ...accommodation })));
}
//# sourceMappingURL=accommodation-composition-result.js.map