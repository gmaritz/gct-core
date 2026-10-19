"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertJourneyStateOwner = assertJourneyStateOwner;
exports.createJourneyStateKey = createJourneyStateKey;
function assertJourneyStateOwner(ownerId) {
    if (typeof ownerId !== "string" || ownerId.trim().length === 0) {
        throw new Error("A validated journey-state owner is required.");
    }
}
function createJourneyStateKey(ownerId, journeyId) {
    assertJourneyStateOwner(ownerId);
    if (typeof journeyId !== "string" || journeyId.trim().length === 0) {
        throw new Error("A public journey identifier is required.");
    }
    return JSON.stringify([ownerId, journeyId]);
}
//# sourceMappingURL=journey-state-ownership.js.map