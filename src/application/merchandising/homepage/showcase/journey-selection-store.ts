import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { Journey } from "../../../journeys";

export interface JourneyBookingContext {
  readonly startDate: string;
  readonly participants: number;
  readonly roomAdults: ReadonlyArray<number>;
}

export class JourneySelectionStore {
  private readonly selections = new Map<string, ReadonlyArray<AccommodationSelectionInput>>();
  private readonly contexts = new Map<string, JourneyBookingContext>();
  private readonly offeredJourneys = new Map<string, Journey>();

  public configure(journeyId: string, context: JourneyBookingContext): void {
    this.contexts.set(journeyId, Object.freeze({
      startDate: context.startDate,
      participants: context.participants,
      roomAdults: Object.freeze([...context.roomAdults]),
    }));
    this.selections.delete(journeyId);
    this.offeredJourneys.delete(journeyId);
  }

  public context(journeyId: string): JourneyBookingContext | undefined {
    return this.contexts.get(journeyId);
  }

  public saveOfferedJourney(journeyId: string, journey: Journey): void {
    this.offeredJourneys.set(journeyId, journey);
  }

  public offeredJourney(journeyId: string): Journey | undefined {
    return this.offeredJourneys.get(journeyId);
  }

  public clear(journeyId: string): void {
    this.selections.delete(journeyId);
    this.contexts.delete(journeyId);
    this.offeredJourneys.delete(journeyId);
  }

  public save(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): void {
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

  public find(journeyId: string): ReadonlyArray<AccommodationSelectionInput> {
    return this.selections.get(journeyId) ?? Object.freeze([]);
  }
}

export const journeySelectionStore = new JourneySelectionStore();