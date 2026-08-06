import { AccommodationAmenity, AccommodationCategory } from "@application/accommodation/models";
import { AccommodationCurrency } from "@application/accommodation/rates";
import { JourneyCompositionSource } from "@application/journeys/validation";
export interface AccommodationCompositionPreferences {
    readonly category?: AccommodationCategory;
    readonly minimumRating?: number;
    readonly amenities?: ReadonlyArray<AccommodationAmenity>;
    readonly collections?: ReadonlyArray<string>;
}
export interface AccommodationCompositionContext {
    readonly requestId: string;
    readonly source: JourneyCompositionSource;
    readonly timestamp: Date;
    readonly destination: string;
    readonly checkInDate: Date;
    readonly checkOutDate: Date;
    readonly adults: number;
    readonly children: number;
    readonly rooms: number;
    readonly channel?: string;
    readonly locale?: string;
    readonly currency?: AccommodationCurrency;
    readonly market?: string;
    readonly preferences?: AccommodationCompositionPreferences;
}
//# sourceMappingURL=accommodation-composition-context.d.ts.map