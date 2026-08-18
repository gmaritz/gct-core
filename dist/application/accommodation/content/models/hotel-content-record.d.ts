export interface HotelContentImage {
    readonly url: string;
    readonly type?: string;
    readonly order: number;
    readonly description?: string;
}
export interface HotelContentCoordinates {
    readonly latitude?: number;
    readonly longitude?: number;
}
export interface HotelContentAddress {
    readonly line1?: string;
    readonly line2?: string;
    readonly city?: string;
    readonly state?: string;
    readonly postalCode?: string;
    readonly countryCode?: string;
    readonly countryName?: string;
}
export interface HotelContentContact {
    readonly email?: string;
    readonly phones: ReadonlyArray<string>;
}
export interface HotelContentFacility {
    readonly code: string;
    readonly name: string;
    readonly groupCode?: string;
    readonly groupName?: string;
}
export interface HotelContentRecord {
    readonly provider: "hotelbeds";
    readonly providerHotelCode: string;
    readonly name: string;
    readonly description?: string;
    readonly categoryCode?: string;
    readonly categoryName?: string;
    readonly starRating?: number;
    readonly accommodationTypeCode?: string;
    readonly accommodationTypeName?: string;
    readonly destinationCode?: string;
    readonly destinationName?: string;
    readonly coordinates: HotelContentCoordinates;
    readonly address?: HotelContentAddress;
    readonly contact?: HotelContentContact;
    readonly facilities: ReadonlyArray<HotelContentFacility>;
    readonly images: ReadonlyArray<HotelContentImage>;
    readonly active: boolean;
    readonly lastUpdatedAt: Date;
    readonly rawLastUpdate?: string;
}
export declare function createHotelContentRecord(record: HotelContentRecord): HotelContentRecord;
//# sourceMappingURL=hotel-content-record.d.ts.map