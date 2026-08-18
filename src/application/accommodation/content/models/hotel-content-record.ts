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

function cloneAddress(address: HotelContentAddress | undefined): HotelContentAddress | undefined {
  if (!address) {
    return undefined;
  }

  return Object.freeze({
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    countryCode: address.countryCode,
    countryName: address.countryName,
  });
}

function cloneContact(contact: HotelContentContact | undefined): HotelContentContact | undefined {
  if (!contact) {
    return undefined;
  }

  return Object.freeze({
    email: contact.email,
    phones: Object.freeze([...(contact.phones ?? [])]),
  });
}

export function createHotelContentRecord(record: HotelContentRecord): HotelContentRecord {
  return Object.freeze({
    provider: "hotelbeds",
    providerHotelCode: record.providerHotelCode,
    name: record.name,
    description: record.description,
    categoryCode: record.categoryCode,
    categoryName: record.categoryName,
    starRating: record.starRating,
    accommodationTypeCode: record.accommodationTypeCode,
    accommodationTypeName: record.accommodationTypeName,
    destinationCode: record.destinationCode,
    destinationName: record.destinationName,
    coordinates: Object.freeze({
      latitude: record.coordinates.latitude,
      longitude: record.coordinates.longitude,
    }),
    address: cloneAddress(record.address),
    contact: cloneContact(record.contact),
    facilities: Object.freeze(
      (record.facilities ?? []).map((facility) =>
        Object.freeze({
          code: facility.code,
          name: facility.name,
          groupCode: facility.groupCode,
          groupName: facility.groupName,
        }),
      ),
    ),
    images: Object.freeze(
      (record.images ?? []).map((image) =>
        Object.freeze({
          url: image.url,
          type: image.type,
          order: image.order,
          description: image.description,
        }),
      ),
    ),
    active: record.active,
    lastUpdatedAt: new Date(record.lastUpdatedAt.getTime()),
    rawLastUpdate: record.rawLastUpdate,
  });
}
