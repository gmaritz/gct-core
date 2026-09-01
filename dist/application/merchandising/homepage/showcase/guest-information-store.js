"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestInformationStore = exports.GuestInformationStore = void 0;
class GuestInformationStore {
    constructor() {
        this.information = new Map();
    }
    save(journeyId, input) {
        this.information.set(journeyId, Object.freeze({
            contact: Object.freeze({ ...input.contact }),
            leadTravellerIndex: input.leadTravellerIndex,
            travellers: Object.freeze(input.travellers.map((traveller) => Object.freeze({ ...traveller }))),
        }));
    }
    find(journeyId) {
        return this.information.get(journeyId);
    }
}
exports.GuestInformationStore = GuestInformationStore;
exports.guestInformationStore = new GuestInformationStore();
//# sourceMappingURL=guest-information-store.js.map