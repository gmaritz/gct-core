import { PricingViewModel } from "../../../application/pricing";

export interface JourneyQuoteAccommodationViewModel {
  readonly property: string;
  readonly room: string;
  readonly rate: string;
  readonly amount: number;
  readonly currency: string;
}

export interface JourneyQuoteViewModel {
  readonly journeyId: string;
  readonly journeyTitle: string;
  readonly status: "PRICED" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "INVALID" | "NOT_FOUND";
  readonly accommodation: ReadonlyArray<JourneyQuoteAccommodationViewModel>;
  readonly pricing?: PricingViewModel;
  readonly message: string;
  readonly recoveryHref: string;
}