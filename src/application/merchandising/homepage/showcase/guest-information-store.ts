import { GuestInformationInput } from "./guest-information-service";
import { createJourneyStateKey } from "./journey-state-ownership";

export class GuestInformationStore {
  private readonly information = new Map<string, GuestInformationInput>();

  public save(ownerId: string, journeyId: string, input: GuestInformationInput): void {
    this.information.set(createJourneyStateKey(ownerId, journeyId), Object.freeze({
      contact: Object.freeze({ ...input.contact }),
      leadTravellerIndex: input.leadTravellerIndex,
      travellers: Object.freeze(input.travellers.map((traveller) => Object.freeze({ ...traveller }))),
    }));
  }

  public find(ownerId: string, journeyId: string): GuestInformationInput | undefined {
    return this.information.get(createJourneyStateKey(ownerId, journeyId));
  }

  public clear(ownerId: string, journeyId: string): void {
    this.information.delete(createJourneyStateKey(ownerId, journeyId));
  }
}

export const guestInformationStore = new GuestInformationStore();