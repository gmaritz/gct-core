import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { Journey } from "../../../journeys";
import { createJourneyStateKey } from "./journey-state-ownership";

export interface JourneyBookingContext {
  readonly startDate: string;
  readonly participants: number;
  readonly roomAdults: ReadonlyArray<number>;
}

export class JourneySelectionStore {
  private readonly selections = new Map<string, ReadonlyArray<AccommodationSelectionInput>>();
  private readonly contexts = new Map<string, JourneyBookingContext>();
  private readonly offeredJourneys = new Map<string, Journey>();

  public configure(ownerId: string, journeyId: string, context: JourneyBookingContext): void {
    const key = createJourneyStateKey(ownerId, journeyId);
    this.contexts.set(key, Object.freeze({
      startDate: context.startDate,
      participants: context.participants,
      roomAdults: Object.freeze([...context.roomAdults]),
    }));
    this.selections.delete(key);
    this.offeredJourneys.delete(key);
  }

  public context(ownerId: string, journeyId: string): JourneyBookingContext | undefined {
    return this.contexts.get(createJourneyStateKey(ownerId, journeyId));
  }

  public saveOfferedJourney(ownerId: string, journeyId: string, journey: Journey): void {
    this.offeredJourneys.set(createJourneyStateKey(ownerId, journeyId), journey);
  }

  public offeredJourney(ownerId: string, journeyId: string): Journey | undefined {
    return this.offeredJourneys.get(createJourneyStateKey(ownerId, journeyId));
  }

  public clear(ownerId: string, journeyId: string): void {
    const key = createJourneyStateKey(ownerId, journeyId);
    this.selections.delete(key);
    this.contexts.delete(key);
    this.offeredJourneys.delete(key);
  }

  public save(ownerId: string, journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): void {
    this.selections.set(createJourneyStateKey(ownerId, journeyId), Object.freeze(selections.map((selection) => Object.freeze({
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

  public find(ownerId: string, journeyId: string): ReadonlyArray<AccommodationSelectionInput> {
    return this.selections.get(createJourneyStateKey(ownerId, journeyId)) ?? Object.freeze([]);
  }
}

export const journeySelectionStore = new JourneySelectionStore();