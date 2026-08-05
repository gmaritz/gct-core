export interface HotelbedsAddress {
  readonly content?: string;
  readonly address1?: string;
  readonly address2?: string;
  readonly street?: string;
  readonly number?: string;
  readonly floor?: string;
  readonly door?: string;
  readonly postalCode?: string;
  readonly city?: string;
  readonly state?: string;
  readonly countryCode?: string;
  readonly countryName?: string;
  readonly email?: string;
  readonly phones?: ReadonlyArray<string>;
}