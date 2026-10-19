import { Journey } from "../../../journeys";
import { PricingEngine, PricingEngineResult } from "../../../pricing";
import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { JourneySelectionStore } from "./journey-selection-store";
export type JourneyQuoteStatus = "PRICED" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "INVALID" | "NOT_FOUND" | "CURRENCY_UNCONFIRMED";
export interface JourneyQuoteResult {
    readonly status: JourneyQuoteStatus;
    readonly journeyId: string;
    readonly journey?: Journey;
    readonly pricing?: PricingEngineResult;
    readonly groupComponent?: {
        readonly amount: number;
        readonly currency: string;
    };
    readonly selections: ReadonlyArray<AccommodationSelectionInput>;
}
export interface JourneyQuoteService {
    priceJourney(ownerId: string, journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<JourneyQuoteResult>;
    priceCurrentJourney(ownerId: string, journeyId: string): Promise<JourneyQuoteResult>;
}
export declare function createDefaultPricingEngine(): PricingEngine;
export declare class DefaultJourneyQuoteService implements JourneyQuoteService {
    private readonly resolver;
    private readonly pricingEngine;
    private readonly selectionStore;
    constructor(resolver: DynamicHomepageJourneyResolver, pricingEngine: PricingEngine, selectionStore?: JourneySelectionStore);
    priceJourney(ownerId: string, journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<JourneyQuoteResult>;
    priceCurrentJourney(ownerId: string, journeyId: string): Promise<JourneyQuoteResult>;
}
//# sourceMappingURL=journey-quote-service.d.ts.map