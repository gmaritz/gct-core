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
        const normalizedSelections = [];
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
            const requestedOccupancy = option.requestedOccupancy?.rooms;
            if (requestedOccupancy && requestedOccupancy.length !== roomSelections.length) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            const normalizedRoomSelections = roomSelections.map((roomSelection, index) => ({
                ...roomSelection,
                roomSlotId: roomSelection.roomSlotId ?? requestedOccupancy?.[index]?.slotId,
            }));
            const seenRoomRateReferences = new Set();
            const seenRateReferences = new Set();
            if (normalizedRoomSelections.some((roomSelection, index) => {
                const slot = requestedOccupancy?.[index];
                const roomRateIdentity = JSON.stringify([
                    roomSelection.roomReference.provider,
                    roomSelection.roomReference.opaqueReference,
                    roomSelection.rateReference.provider,
                    roomSelection.rateReference.opaqueReference,
                ]);
                const rateIdentity = JSON.stringify([roomSelection.rateReference.provider, roomSelection.rateReference.opaqueReference]);
                if (seenRoomRateReferences.has(roomRateIdentity) || seenRateReferences.has(rateIdentity))
                    return true;
                seenRoomRateReferences.add(roomRateIdentity);
                seenRateReferences.add(rateIdentity);
                return Boolean(slot?.slotId && roomSelection.roomSlotId !== slot.slotId);
            })) {
                return { status: "INVALID", journeyId, selectedStops: [] };
            }
            const selectedRates = normalizedRoomSelections.map((roomSelection) => {
                const room = option.roomOptions?.find((candidate) => candidate.reference.provider === roomSelection.roomReference.provider
                    && candidate.reference.opaqueReference === roomSelection.roomReference.opaqueReference);
                return room?.rateOptions.find((candidate) => candidate.reference.provider === roomSelection.rateReference.provider
                    && candidate.reference.opaqueReference === roomSelection.rateReference.opaqueReference);
            });
            if (selectedRates.some((rate) => !rate))
                return { status: "INVALID", journeyId, selectedStops: [] };
            if (selectedRates.some((rate) => rate.pricing.currency !== selectedRates[0].pricing.currency)) {
                return { status: "CURRENCY_UNCONFIRMED", journeyId, selectedStops: [] };
            }
            if (requestedOccupancy?.some((occupancy, index) => {
                const offered = selectedRates[index]?.occupancy.rooms[0];
                return selectedRates[index]?.occupancy.rooms.length !== 1
                    || !offered
                    || offered.adults !== occupancy.adults
                    || offered.children !== occupancy.children
                    || offered.childAges.length !== occupancy.childAges.length
                    || offered.childAges.some((age, ageIndex) => age !== occupancy.childAges[ageIndex]);
            })) {
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
                    roomReference: normalizedRoomSelections[0].roomReference,
                    rateReference: normalizedRoomSelections[0].rateReference,
                    roomSelections: normalizedRoomSelections,
                });
                if (requestedOccupancy?.some((occupancy, index) => {
                    const selectedRate = selected.pricingInput?.roomRates?.[index]?.rate;
                    const offered = selectedRate?.occupancy.rooms[0];
                    return !selectedRate || !offered || selectedRate.occupancy.rooms.length !== 1
                        || offered.adults !== occupancy.adults
                        || offered.children !== occupancy.children
                        || offered.childAges.length !== occupancy.childAges.length
                        || offered.childAges.some((age, ageIndex) => age !== occupancy.childAges[ageIndex]);
                })) {
                    return { status: "INVALID", journeyId, selectedStops: [] };
                }
                const roomRates = selected.pricingInput?.roomRates ?? [];
                if (roomRates.some((roomRate, index) => index > 0 && roomRate.rate.pricing.currency !== roomRates[0]?.rate.pricing.currency)) {
                    return { status: "CURRENCY_UNCONFIRMED", journeyId, selectedStops: [] };
                }
                selectedStops.push({
                    stopId: selected.packageStop?.stopId ?? input.stopId,
                    accommodationId: selected.accommodationId,
                    roomReference: firstRoomSelection.roomReference.opaqueReference,
                    rateReference: firstRoomSelection.rateReference.opaqueReference,
                });
                normalizedSelections.push({
                    ...input,
                    stopId: selected.packageStop?.stopId ?? input.stopId,
                    roomReference: firstRoomSelection.roomReference,
                    rateReference: firstRoomSelection.rateReference,
                    roomSelections: normalizedRoomSelections,
                });
            }
            catch {
                return { status: "STALE", journeyId, selectedStops: [] };
            }
        }
        this.selectionStore.save(ownerId, journeyId, normalizedSelections);
        return { status: "COMPLETE", journeyId, selectedStops };
    }
}
exports.DefaultAccommodationSelectionService = DefaultAccommodationSelectionService;
//# sourceMappingURL=accommodation-selection-service.js.map