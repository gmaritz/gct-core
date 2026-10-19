"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestInformationStore = exports.GuestInformationStore = void 0;
const journey_state_ownership_1 = require("./journey-state-ownership");
class GuestInformationStore {
    constructor() {
        this.information = new Map();
    }
    save(ownerId, journeyId, input) {
        this.information.set((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId), Object.freeze({
            contact: Object.freeze({ ...input.contact }),
            leadTravellerIndex: input.leadTravellerIndex,
            travellers: Object.freeze(input.travellers.map((traveller) => Object.freeze({ ...traveller }))),
        }));
    }
    find(ownerId, journeyId) {
        return this.information.get((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId));
    }
    clear(ownerId, journeyId) {
        this.information.delete((0, journey_state_ownership_1.createJourneyStateKey)(ownerId, journeyId));
    }
}
exports.GuestInformationStore = GuestInformationStore;
exports.guestInformationStore = new GuestInformationStore();
//# sourceMappingURL=guest-information-store.js.map