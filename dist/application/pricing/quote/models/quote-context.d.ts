import { PricingEngineResult } from "../../engine";
export interface QuoteTravellerSummary {
    readonly travellerCount: number;
    readonly leadTravellerName?: string;
}
export interface QuoteJourneySummary {
    readonly journeyId: string;
    readonly title?: string;
    readonly destination?: string;
    readonly duration?: string;
}
export interface QuotePricingSummary {
    readonly currency: string;
    readonly subtotal: number;
    readonly taxes: number;
    readonly discounts: number;
    readonly total: number;
}
export interface QuoteQuotationMetadata {
    readonly quotationNumber?: string;
    readonly externalReference?: string;
    readonly customerReference?: string;
    readonly validityDays?: number;
    readonly source?: string;
}
export interface QuoteContext {
    readonly pricingEngineResult: PricingEngineResult;
    readonly travellerSummary: QuoteTravellerSummary;
    readonly journeySummary: QuoteJourneySummary;
    readonly pricingSummary: QuotePricingSummary;
    readonly quotationMetadata: QuoteQuotationMetadata;
    readonly createdAt: Date;
    readonly metadata: {
        readonly version: string;
        readonly requestId: string;
        readonly source: string;
    };
}
export interface QuoteContextRequest {
    readonly pricingEngineResult: PricingEngineResult;
    readonly travellerSummary: QuoteTravellerSummary;
    readonly journeySummary: QuoteJourneySummary;
    readonly quotationMetadata?: QuoteQuotationMetadata;
    readonly requestId?: string;
    readonly source?: string;
}
export declare function createQuoteContext(request: QuoteContextRequest): QuoteContext;
//# sourceMappingURL=quote-context.d.ts.map