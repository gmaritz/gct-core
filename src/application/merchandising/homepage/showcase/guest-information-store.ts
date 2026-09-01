import { GuestInformationInput } from "./guest-information-service";

export class GuestInformationStore {
  private readonly information = new Map<string, GuestInformationInput>();

  public save(journeyId: string, input: GuestInformationInput): void {
    this.information.set(journeyId, Object.freeze({
      contact: Object.freeze({ ...input.contact }),
      leadTravellerIndex: input.leadTravellerIndex,
      travellers: Object.freeze(input.travellers.map((traveller) => Object.freeze({ ...traveller }))),
    }));
  }

  public find(journeyId: string): GuestInformationInput | undefined {
    return this.information.get(journeyId);
  }
}

export const guestInformationStore = new GuestInformationStore();