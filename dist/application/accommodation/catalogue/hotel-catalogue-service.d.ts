import { AccommodationSearchCriteria } from "../discovery/accommodation-search-criteria";
import { HotelCatalogueEntry } from "./hotel-catalogue-entry";
import { HotelCatalogueRepository } from "./hotel-catalogue-repository";
export type HotelCatalogueSelectionMode = "EXPLICIT" | "ATTRIBUTE";
export interface HotelCatalogueSelection {
    readonly hotelCodes: ReadonlyArray<string>;
    readonly selectionMode: HotelCatalogueSelectionMode;
}
export declare class HotelCatalogueService {
    private readonly repository;
    constructor(repository: HotelCatalogueRepository);
    select(criteria: Pick<AccommodationSearchCriteria, "hotelCodes" | "destinationCode" | "zoneCode" | "starGrading">): Promise<HotelCatalogueSelection>;
    find(criteria: Pick<AccommodationSearchCriteria, "hotelCodes" | "destinationCode" | "zoneCode" | "starGrading">): Promise<ReadonlyArray<HotelCatalogueEntry>>;
}
//# sourceMappingURL=hotel-catalogue-service.d.ts.map