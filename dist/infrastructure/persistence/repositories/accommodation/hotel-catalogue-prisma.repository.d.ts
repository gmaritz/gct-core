import { HotelCatalogueRepository, HotelCatalogueFilter, HotelCatalogueEntry } from "../../../../application/accommodation/catalogue";
export declare class HotelCataloguePrismaRepository implements HotelCatalogueRepository {
    findActive(filter?: HotelCatalogueFilter): Promise<ReadonlyArray<HotelCatalogueEntry>>;
    upsert(entry: HotelCatalogueEntry): Promise<"inserted" | "updated" | "unchanged">;
    deactivateMissing(hotelCodes: ReadonlyArray<string>): Promise<number>;
}
//# sourceMappingURL=hotel-catalogue-prisma.repository.d.ts.map