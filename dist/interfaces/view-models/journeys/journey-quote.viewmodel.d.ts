import { PricingViewModel } from "../../../application/pricing";
export interface JourneyQuoteAccommodationViewModel {
    readonly stopId?: string;
    readonly destination?: string;
    readonly checkIn?: string;
    readonly checkOut?: string;
    readonly property: string;
    readonly room: string;
    readonly rate: string;
    readonly amount?: number;
    readonly currency: string;
}
export interface JourneyQuoteViewModel {
    readonly journeyTitle: string;
    readonly status: "PRICED" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "INVALID" | "NOT_FOUND" | "CURRENCY_UNCONFIRMED";
    readonly accommodation: ReadonlyArray<JourneyQuoteAccommodationViewModel>;
    readonly pricing?: PricingViewModel;
    readonly message: string;
    readonly recoveryHref: string;
    readonly journeyId: string;
    readonly groupComponent?: {
        readonly amount: number;
        readonly currency: string;
    };
    readonly accommodationTotal?: number;
    readonly participantCount?: number;
    readonly roomAllocation?: ReadonlyArray<number>;
}
//# sourceMappingURL=journey-quote.viewmodel.d.ts.map