import { HotelbedsAddress } from "./hotelbeds-address";
import { HotelbedsDestination } from "./hotelbeds-destination";
import { HotelbedsFacility } from "./hotelbeds-facility";
import { HotelbedsImage } from "./hotelbeds-image";
import { HotelbedsLocation } from "./hotelbeds-location";
import { HotelbedsRoom } from "./hotelbeds-room";

export interface HotelbedsCreditCard {
  readonly code?: string;
  readonly name?: string;
}

export interface HotelbedsKeyword {
  readonly code: number;
  readonly rating?: number;
}

export interface HotelbedsReview {
  readonly rate?: string;
  readonly reviewCount?: number;
  readonly type?: "TRIPADVISOR" | "HOTELBEDS" | string;
}

export interface HotelbedsSupplier {
  readonly name?: string;
  readonly vatNumber?: string;
}

export interface HotelbedsUpselling {
  readonly rooms?: ReadonlyArray<HotelbedsRoom>;
}

export interface HotelbedsHotel {
  readonly checkIn?: string;
  readonly checkOut?: string;
  readonly code?: number;
  readonly name?: string;
  readonly description?: string;
  readonly S2C?: string;
  readonly ranking?: number;
  readonly accommodationTypeCode?: string;
  readonly accommodationTypeName?: string;
  readonly categoryCode?: string;
  readonly categoryName?: string;
  readonly destinationCode?: string;
  readonly destinationName?: string;
  readonly zoneCode?: number | string;
  readonly zoneName?: string;
  readonly latitude?: string;
  readonly longitude?: string;
  readonly giata?: string;
  readonly chainCode?: string;
  readonly chainName?: string;
  readonly minRate?: string;
  readonly maxRate?: string;
  readonly totalSellingRate?: number | string;
  readonly totalNet?: number | string;
  readonly pendingAmount?: number | string;
  readonly currency?: string;
  readonly cancellationAmount?: string;
  readonly exclusiveDeal?: number;
  readonly paymentDataRequired?: boolean;
  readonly PMSRoomCode?: string;
  readonly address?: HotelbedsAddress;
  readonly location?: HotelbedsLocation;
  readonly destination?: HotelbedsDestination;
  readonly images?: ReadonlyArray<HotelbedsImage>;
  readonly facilities?: ReadonlyArray<HotelbedsFacility>;
  readonly rooms?: ReadonlyArray<HotelbedsRoom>;
  readonly keywords?: ReadonlyArray<HotelbedsKeyword>;
  readonly reviews?: ReadonlyArray<HotelbedsReview>;
  readonly creditCards?: ReadonlyArray<HotelbedsCreditCard>;
  readonly supplier?: HotelbedsSupplier;
  readonly upselling?: HotelbedsUpselling;
  readonly clientComments?: string;
}