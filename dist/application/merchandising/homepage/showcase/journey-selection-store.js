"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journeySelectionStore = exports.JourneySelectionStore = void 0;
class JourneySelectionStore {
    constructor() {
        this.selections = new Map();
    }
    save(journeyId, selections) {
        this.selections.set(journeyId, Object.freeze(selections.map((selection) => Object.freeze({
            ...selection,
            roomReference: Object.freeze({ ...selection.roomReference }),
            rateReference: Object.freeze({ ...selection.rateReference }),
        }))));
    }
    find(journeyId) {
        return this.selections.get(journeyId) ?? Object.freeze([]);
    }
}
exports.JourneySelectionStore = JourneySelectionStore;
exports.journeySelectionStore = new JourneySelectionStore();
//# sourceMappingURL=journey-selection-store.js.map