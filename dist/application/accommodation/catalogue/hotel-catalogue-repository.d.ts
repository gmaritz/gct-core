import { HotelCatalogueEntry } from "./hotel-catalogue-entry";
export interface HotelCatalogueFilter {
    readonly hotelCodes?: ReadonlyArray<string>;
    readonly destinationCode?: string;
    readonly zoneCode?: string;
    readonly starGrading?: number;
}
export interface HotelCatalogueRepository {
    findActive(filter?: HotelCatalogueFilter): Promise<ReadonlyArray<HotelCatalogueEntry>>;
    upsert(entry: HotelCatalogueEntry): Promise<"inserted" | "updated" | "unchanged">;
    deactivateMissing(hotelCodes: ReadonlyArray<string>): Promise<number>;
}
export declare class InMemoryHotelCatalogueRepository implements HotelCatalogueRepository {
    private readonly entries;
    findActive(filter?: HotelCatalogueFilter): Promise<ReadonlyArray<HotelCatalogueEntry>>;
    upsert(entry: HotelCatalogueEntry): Promise<"inserted" | "updated" | "unchanged">;
    deactivateMissing(hotelCodes: ReadonlyArray<string>): Promise<number>;
}
//# sourceMappingURL=hotel-catalogue-repository.d.ts.map