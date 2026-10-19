"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journeySelectionStore = exports.JourneySelectionStore = void 0;
const journey_state_ownership_1 = require("./journey-state-ownership");
class JourneySelectionStore {
    constructor() {
        this.selections = new Map();
        this.contexts = new Map();
        this.offeredJourneys = new Map();
    }
    configure(ownerId, journeyId, context) {
        const key = (0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId);
        this.contexts.set(key, Object.freeze({
            startDate: context.startDate,
            participants: context.participants,
            roomAdults: Object.freeze([...context.roomAdults]),
        }));
        this.selections.delete(key);
        this.offeredJourneys.delete(key);
    }
    context(ownerId, journeyId) {
        return this.contexts.get((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId));
    }
    saveOfferedJourney(ownerId, journeyId, journey) {
        this.offeredJourneys.set((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId), journey);
    }
    offeredJourney(ownerId, journeyId) {
        return this.offeredJourneys.get((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId));
    }
    clear(ownerId, journeyId) {
        const key = (0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId);
        this.selections.delete(key);
        this.contexts.delete(key);
        this.offeredJourneys.delete(key);
    }
    save(ownerId, journeyId, selections) {
        this.selections.set((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId), Object.freeze(selections.map((selection) => Object.freeze({
            ...selection,
            roomReference: selection.roomReference ? Object.freeze({ ...selection.roomReference }) : undefined,
            rateReference: selection.rateReference ? Object.freeze({ ...selection.rateReference }) : undefined,
            roomSelections: selection.roomSelections
                ? Object.freeze(selection.roomSelections.map((roomSelection) => Object.freeze({
                    roomReference: Object.freeze({ ...roomSelection.roomReference }),
                    rateReference: Object.freeze({ ...roomSelection.rateReference }),
                })))
                : undefined,
        }))));
    }
    find(ownerId, journeyId) {
        return this.selections.get((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId)) ?? Object.freeze([]);
    }
}
exports.JourneySelectionStore = JourneySelectionStore;
exports.journeySelectionStore = new JourneySelectionStore();
//# sourceMappingURL=journey-selection-store.js.map