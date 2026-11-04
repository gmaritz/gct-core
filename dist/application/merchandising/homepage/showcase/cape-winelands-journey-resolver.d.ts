import { AccommodationAvailabilityService, HotelCatalogueService } from "../../../accommodation";
import { JourneyBookingContext, JourneySelectionStore } from "./journey-selection-store";
import { DynamicHomepageJourneyResolution, DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
export declare const CAPE_WINELANDS_JOURNEY_ID = "journey-homepage-journey-001";
export declare const CAPE_WINELANDS_OCCUPANCY_POLICY: Readonly<{
    childrenAllowed: false;
}>;
export interface CapeWinelandsStay {
    readonly stopId: string;
    readonly stopOrder: number;
    readonly destination: "Stellenbosch" | "Hermanus";
    readonly checkInDate: Date;
    readonly checkOutDate: Date;
    readonly nights: number;
}
export declare const CAPE_WINELANDS_STOPS: readonly (Readonly<{
    stopId: "cape-winelands-stellenbosch";
    stopOrder: 1;
    destination: "Stellenbosch";
    nights: 2;
}> | Readonly<{
    stopId: "cape-winelands-hermanus";
    stopOrder: 2;
    destination: "Hermanus";
    nights: 1;
}>)[];
export declare function parseDateOnly(value: unknown): Date | undefined;
export declare function calculateCapeWinelandsStays(startDate: string): ReadonlyArray<CapeWinelandsStay>;
export declare class CapeWinelandsJourneyResolver implements DynamicHomepageJourneyResolver {
    private readonly catalogueService;
    private readonly availabilityService;
    private readonly fallbackResolver;
    private readonly selectionStore;
    constructor(catalogueService: HotelCatalogueService, availabilityService: AccommodationAvailabilityService, fallbackResolver?: DynamicHomepageJourneyResolver, selectionStore?: JourneySelectionStore);
    resolve(ownerId: string, journeyId: string, selection?: JourneyBookingContext): Promise<DynamicHomepageJourneyResolution>;
    private activeProperties;
    private availableOptions;
    private composeJourney;
}
export declare function validateBookingContext(context: JourneyBookingContext, policy?: {
    readonly childrenAllowed: boolean;
}): string | undefined;
//# sourceMappingURL=cape-winelands-journey-resolver.d.ts.map