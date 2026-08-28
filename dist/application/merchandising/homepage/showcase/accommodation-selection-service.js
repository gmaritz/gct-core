"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationSelectionService = void 0;
const journeys_1 = require("../../../journeys");
function isValidReference(reference) {
    return typeof reference === "object" && reference !== null
        && typeof reference.provider === "string"
        && typeof reference.opaqueReference === "string";
}
function findOption(journey, input) {
    return journey.accommodation.find((option) => option.accommodationId === input.accommodationId
        && (!input.stopId || option.packageStop?.stopId === input.stopId));
}
class DefaultAccommodationSelectionService {
    constructor(resolver) {
        this.resolver = resolver;
    }
    async selectAccommodation(journeyId, selections) {
        const resolution = await this.resolver.resolve(journeyId);
        if (resolution.status === "INVALID" || resolution.status === "NOT_FOUND" || resolution.status === "UNAVAILABLE") {
            return { status: resolution.status, journeyId, selectedStops: [] };
        }
        if (!Array.isArray(selections) || selections.length !== resolution.journey?.accommodation.length) {
            return { status: "INCOMPLETE", journeyId, selectedStops: [] };
        }
        const selectedStops = [];
        for (const input of selections) {
            if (!isValidReference(input.roomReference) || !isValidReference(input.rateReference)) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            const option = findOption(resolution.journey, input);
            if (!option) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            try {
                const selected = (0, journeys_1.selectJourneyAccommodation)(option, {
                    accommodationId: input.accommodationId,
                    packageStopId: input.stopId,
                    roomReference: input.roomReference,
                    rateReference: input.rateReference,
                });
                selectedStops.push({
                    stopId: selected.packageStop?.stopId,
                    accommodationId: selected.accommodationId,
                    roomReference: input.roomReference.opaqueReference,
                    rateReference: input.rateReference.opaqueReference,
                });
            }
            catch {
                return { status: "STALE", journeyId, selectedStops: [] };
            }
        }
        return { status: "COMPLETE", journeyId, selectedStops };
    }
}
exports.DefaultAccommodationSelectionService = DefaultAccommodationSelectionService;
//# sourceMappingURL=accommodation-selection-service.js.map