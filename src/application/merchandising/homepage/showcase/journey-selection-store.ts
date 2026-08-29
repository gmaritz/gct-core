import { AccommodationSelectionInput } from "./accommodation-selection-service";

export class JourneySelectionStore {
  private readonly selections = new Map<string, ReadonlyArray<AccommodationSelectionInput>>();

  public save(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): void {
    this.selections.set(journeyId, Object.freeze(selections.map((selection) => Object.freeze({
      ...selection,
      roomReference: Object.freeze({ ...selection.roomReference }),
      rateReference: Object.freeze({ ...selection.rateReference }),
    }))));
  }

  public find(journeyId: string): ReadonlyArray<AccommodationSelectionInput> {
    return this.selections.get(journeyId) ?? Object.freeze([]);
  }
}

export const journeySelectionStore = new JourneySelectionStore();