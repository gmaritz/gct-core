import { AccommodationSearchCriteria } from "../discovery/accommodation-search-criteria";
import { HotelCatalogueEntry } from "./hotel-catalogue-entry";
import { HotelCatalogueRepository } from "./hotel-catalogue-repository";
export type HotelCatalogueSelectionMode = "EXPLICIT" | "ATTRIBUTE";
export interface HotelCatalogueSelection {
    readonly hotelCodes: ReadonlyArray<string>;
    readonly selectionMode: HotelCatalogueSelectionMode;
}
type HotelSelectionCriteria = Pick<AccommodationSearchCriteria, "hotelCodes" | "destinationCode" | "zoneCode" | "starGrading">;
export declare class HotelCatalogueService {
    private readonly repository;
    constructor(repository: HotelCatalogueRepository);
    private resolveEntries;
    select(criteria: HotelSelectionCriteria): Promise<HotelCatalogueSelection>;
    find(criteria: HotelSelectionCriteria): Promise<ReadonlyArray<HotelCatalogueEntry>>;
}
export {};
//# sourceMappingURL=hotel-catalogue-service.d.ts.map