export interface HotelbedsDestinationZone {
    readonly zoneCode?: string | number;
    readonly zoneName?: string;
}
export interface HotelbedsDestinationGroupZone {
    readonly groupZoneCode?: string | number;
    readonly groupZoneName?: string;
}
export interface HotelbedsDestination {
    readonly code?: string;
    readonly name?: string;
    readonly countryCode?: string;
    readonly isoCode?: string;
    readonly zones?: ReadonlyArray<HotelbedsDestinationZone>;
    readonly groupZones?: ReadonlyArray<HotelbedsDestinationGroupZone>;
}
//# sourceMappingURL=hotelbeds-destination.d.ts.map