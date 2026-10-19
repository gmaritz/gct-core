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
    configure(ownerId: string, journeyId: string, context: JourneyBookingContext): void;
    context(ownerId: string, journeyId: string): JourneyBookingContext | undefined;
    saveOfferedJourney(ownerId: string, journeyId: string, journey: Journey): void;
    offeredJourney(ownerId: string, journeyId: string): Journey | undefined;
    clear(ownerId: string, journeyId: string): void;
    save(ownerId: string, journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): void;
    find(ownerId: string, journeyId: string): ReadonlyArray<AccommodationSelectionInput>;
}
export declare const journeySelectionStore: JourneySelectionStore;
//# sourceMappingURL=journey-selection-store.d.ts.map