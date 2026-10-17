"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journeySelectionStore = exports.JourneySelectionStore = void 0;
class JourneySelectionStore {
    constructor() {
        this.selections = new Map();
        this.contexts = new Map();
        this.offeredJourneys = new Map();
    }
    configure(journeyId, context) {
        this.contexts.set(journeyId, Object.freeze({
            startDate: context.startDate,
            participants: context.participants,
            roomAdults: Object.freeze([...context.roomAdults]),
        }));
        this.selections.delete(journeyId);
        this.offeredJourneys.delete(journeyId);
    }
    context(journeyId) {
        return this.contexts.get(journeyId);
    }
    saveOfferedJourney(journeyId, journey) {
        this.offeredJourneys.set(journeyId, journey);
    }
    offeredJourney(journeyId) {
        return this.offeredJourneys.get(journeyId);
    }
    clear(journeyId) {
        this.selections.delete(journeyId);
        this.contexts.delete(journeyId);
        this.offeredJourneys.delete(journeyId);
    }
    save(journeyId, selections) {
        this.selections.set(journeyId, Object.freeze(selections.map((selection) => Object.freeze({
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
    find(journeyId) {
        return this.selections.get(journeyId) ?? Object.freeze([]);
    }
}
exports.JourneySelectionStore = JourneySelectionStore;
exports.journeySelectionStore = new JourneySelectionStore();
//# sourceMappingURL=journey-selection-store.js.map