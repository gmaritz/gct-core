import { AccommodationSelectionInput } from "./accommodation-selection-service";
export declare class JourneySelectionStore {
    private readonly selections;
    save(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): void;
    find(journeyId: string): ReadonlyArray<AccommodationSelectionInput>;
}
export declare const journeySelectionStore: JourneySelectionStore;
//# sourceMappingURL=journey-selection-store.d.ts.map