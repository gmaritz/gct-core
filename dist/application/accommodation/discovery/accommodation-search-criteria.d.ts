import { AccommodationAmenity, AccommodationCategory } from "../models";
import { AccommodationOccupancyGroup } from "./accommodation-occupancy-group";
export interface AccommodationSearchCriteria {
    readonly destination: string;
    readonly checkInDate: Date;
    readonly checkOutDate: Date;
    readonly sourceMarket?: string;
    readonly occupancies?: ReadonlyArray<AccommodationOccupancyGroup>;
    readonly adults: number;
    readonly children: number;
    readonly rooms: number;
    readonly category?: AccommodationCategory;
    readonly minimumRating?: number;
    readonly amenities?: ReadonlyArray<AccommodationAmenity>;
    readonly collections?: ReadonlyArray<string>;
    readonly hotelCodes?: ReadonlyArray<string>;
    readonly destinationCode?: string;
    readonly zoneCode?: string;
    readonly starGrading?: number;
}
//# sourceMappingURL=accommodation-search-criteria.d.ts.map