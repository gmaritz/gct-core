"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationSelectionService = void 0;
const journeys_1 = require("../../../journeys");
const journey_selection_store_1 = require("./journey-selection-store");
const journey_state_ownership_1 = require("./journey-state-ownership");
function isValidReference(reference) {
    return typeof reference === "object" && reference !== null
        && typeof reference.provider === "string"
        && typeof reference.opaqueReference === "string";
}
function findOption(journey, input) {
    return journey.accommodation.find((option) => option.accommodationId === input.accommodationId
        && (!input.stopId || option.packageStop?.stopId === input.stopId));
}
function stopKeys(journey) {
    return new Set(journey.accommodation.map((option, index) => option.packageStop?.stopId ?? `legacy-stop-${index + 1}`));
}
class DefaultAccommodationSelectionService {
    constructor(resolver, selectionStore = journey_selection_store_1.journeySelectionStore) {
        this.resolver = resolver;
        this.selectionStore = selectionStore;
    }
    async selectAccommodation(ownerId, journeyId, selections) {
        (0, journey_state_ownership_1.assertJourneyStateOwner)(ownerId);
        const resolution = await this.resolver.resolve(ownerId, journeyId);
        if (resolution.status === "INVALID" || resolution.status === "NOT_FOUND" || resolution.status === "UNAVAILABLE") {
            return { status: resolution.status, journeyId, selectedStops: [] };
        }
        if (!Array.isArray(selections) || selections.length !== stopKeys(resolution.journey).size) {
            return { status: "INCOMPLETE", journeyId, selectedStops: [] };
        }
        const selectedStops = [];
        const selectedStopIds = new Set();
        for (const input of selections) {
            const roomSelections = input.roomSelections ?? (input.roomReference && input.rateReference
                ? [{ roomReference: input.roomReference, rateReference: input.rateReference }]
                : []);
            const firstRoomSelection = roomSelections[0];
            if (!firstRoomSelection || !roomSelections.every((roomSelection) => isValidReference(roomSelection.roomReference) && isValidReference(roomSelection.rateReference))) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            const option = findOption(resolution.journey, input);
            if (!option) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            const stopId = option.packageStop?.stopId ?? input.stopId ?? option.accommodationId;
            if (selectedStopIds.has(stopId)) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            selectedStopIds.add(stopId);
            try {
                const selected = (0, journeys_1.selectJourneyAccommodation)(option, {
                    accommodationId: input.accommodationId,
                    packageStopId: input.stopId,
                    roomReference: firstRoomSelection.roomReference,
                    rateReference: firstRoomSelection.rateReference,
                    roomSelections,
                });
                const requestedOccupancy = option.requestedOccupancy?.rooms;
                if (requestedOccupancy && requestedOccupancy.length !== roomSelections.length) {
                    return { status: "INVALID", journeyId, selectedStops: [] };
                }
                if (requestedOccupancy?.some((occupancy, index) => {
                    const selectedRate = selected.pricingInput?.roomRates?.[index]?.rate;
                    return !selectedRate || selectedRate.occupancy.rooms.length !== 1
                        || selectedRate.occupancy.rooms[0]?.adults !== occupancy.adults
                        || selectedRate.occupancy.rooms[0]?.children !== 0;
                })) {
                    return { status: "STALE", journeyId, selectedStops: [] };
                }
                selectedStops.push({
                    stopId: selected.packageStop?.stopId ?? input.stopId,
                    accommodationId: selected.accommodationId,
                    roomReference: firstRoomSelection.roomReference.opaqueReference,
                    rateReference: firstRoomSelection.rateReference.opaqueReference,
                });
            }
            catch {
                return { status: "STALE", journeyId, selectedStops: [] };
            }
        }
        this.selectionStore.save(ownerId, journeyId, selections);
        return { status: "COMPLETE", journeyId, selectedStops };
    }
}
exports.DefaultAccommodationSelectionService = DefaultAccommodationSelectionService;
//# sourceMappingURL=accommodation-selection-service.js.map