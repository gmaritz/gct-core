import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { Journey } from "../../../journeys";
export interface JourneyBookingContext {
    readonly startDate: string;
    readonly participants: number;
    readonly roomAdults: ReadonlyArray<number>;
}
export declare class JourneySelectionStore {
    private readonly selections;
    private readonly contexts;
    private readonly offeredJourneys;
    configure(journeyId: string, context: JourneyBookingContext): void;
    context(journeyId: string): JourneyBookingContext | undefined;
    saveOfferedJourney(journeyId: string, journey: Journey): void;
    offeredJourney(journeyId: string): Journey | undefined;
    clear(journeyId: string): void;
    save(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): void;
    find(journeyId: string): ReadonlyArray<AccommodationSelectionInput>;
}
export declare const journeySelectionStore: JourneySelectionStore;
//# sourceMappingURL=journey-selection-store.d.ts.map