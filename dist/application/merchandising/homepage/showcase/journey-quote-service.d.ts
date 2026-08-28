import { Journey } from "../../../journeys";
import { PricingEngine, PricingEngineResult } from "../../../pricing";
import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
export type JourneyQuoteStatus = "PRICED" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "INVALID" | "NOT_FOUND";
export interface JourneyQuoteResult {
    readonly status: JourneyQuoteStatus;
    readonly journeyId: string;
    readonly journey?: Journey;
    readonly pricing?: PricingEngineResult;
    readonly selections: ReadonlyArray<AccommodationSelectionInput>;
}
export interface JourneyQuoteService {
    priceJourney(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<JourneyQuoteResult>;
    priceCurrentJourney(journeyId: string): Promise<JourneyQuoteResult>;
}
export declare function createDefaultPricingEngine(): PricingEngine;
export declare class DefaultJourneyQuoteService implements JourneyQuoteService {
    private readonly resolver;
    private readonly pricingEngine;
    constructor(resolver: DynamicHomepageJourneyResolver, pricingEngine: PricingEngine);
    priceJourney(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<JourneyQuoteResult>;
    priceCurrentJourney(journeyId: string): Promise<JourneyQuoteResult>;
}
//# sourceMappingURL=journey-quote-service.d.ts.map