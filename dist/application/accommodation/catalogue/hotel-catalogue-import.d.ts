import { HotelCatalogueRepository } from "./hotel-catalogue-repository";
export interface HotelCatalogueSourceRow {
    readonly hotelName?: string;
    readonly hotelCode?: string | number;
    readonly starGrading?: string | number;
    readonly destinationCode?: string;
    readonly zoneCode?: string | number;
    readonly zoneName?: string;
}
export interface HotelCatalogueImportReport {
    readonly inserted: number;
    readonly updated: number;
    readonly unchanged: number;
    readonly rejected: ReadonlyArray<{
        readonly row: number;
        readonly reason: string;
    }>;
    readonly deactivated: number;
}
export declare function importHotelCatalogue(rows: ReadonlyArray<HotelCatalogueSourceRow>, repository: HotelCatalogueRepository): Promise<HotelCatalogueImportReport>;
export declare function readHotelCatalogueWorkbook(buffer: Buffer, destinationCode: string): ReadonlyArray<HotelCatalogueSourceRow>;
//# sourceMappingURL=hotel-catalogue-import.d.ts.map