export type HotelbedsCoordinateValue = string | number;

export interface HotelbedsGroupZone {
  readonly groupZoneCode?: string | number;
  readonly groupZoneName?: string;
}

export interface HotelbedsLocation {
  readonly latitude?: HotelbedsCoordinateValue;
  readonly longitude?: HotelbedsCoordinateValue;
  readonly destinationCode?: string;
  readonly destinationName?: string;
  readonly zoneCode?: string | number;
  readonly zoneName?: string;
  readonly countryCode?: string;
  readonly stateCode?: string;
  readonly city?: string;
  readonly postalCode?: string;
  readonly groupZones?: ReadonlyArray<HotelbedsGroupZone>;
}