import { AccommodationAmenity } from "./accommodation-amenity";
import { AccommodationCategory } from "./accommodation-category";
import { AccommodationContact } from "./accommodation-contact";
import { AccommodationIdentity } from "./accommodation-identity";
import { AccommodationImage } from "./accommodation-image";
import { AccommodationLocation } from "./accommodation-location";
import { AccommodationPolicy } from "./accommodation-policy";
import { AccommodationProviderReference } from "./accommodation-provider-reference";
import { AccommodationRating } from "./accommodation-rating";
export interface Accommodation {
    readonly identity: AccommodationIdentity;
    readonly category: AccommodationCategory;
    readonly location: AccommodationLocation;
    readonly rating: AccommodationRating;
    readonly images: ReadonlyArray<AccommodationImage>;
    readonly amenities: ReadonlyArray<AccommodationAmenity>;
    readonly policies: ReadonlyArray<AccommodationPolicy>;
    readonly contacts: ReadonlyArray<AccommodationContact>;
    readonly providerReference: AccommodationProviderReference;
}
//# sourceMappingURL=accommodation.d.ts.map