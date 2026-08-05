import { AccommodationAmenity, AccommodationCategory } from "../models";

export interface AccommodationSearchCriteria {
  readonly destination: string;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly adults: number;
  readonly children: number;
  readonly rooms: number;
  readonly category?: AccommodationCategory;
  readonly minimumRating?: number;
  readonly amenities?: ReadonlyArray<AccommodationAmenity>;
  readonly collections?: ReadonlyArray<string>;
}