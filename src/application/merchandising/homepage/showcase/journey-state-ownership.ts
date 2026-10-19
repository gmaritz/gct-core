export function assertJourneyStateOwner(ownerId: string): void {
  if (typeof ownerId !== "string" || ownerId.trim().length === 0) {
    throw new Error("A validated journey-state owner is required.");
  }
}

export function createJourneyStateKey(ownerId: string, journeyId: string): string {
  assertJourneyStateOwner(ownerId);
  if (typeof journeyId !== "string" || journeyId.trim().length === 0) {
    throw new Error("A public journey identifier is required.");
  }
  return JSON.stringify([ownerId, journeyId]);
}
