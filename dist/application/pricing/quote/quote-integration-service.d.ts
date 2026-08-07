import { ApplicationService } from "../../application-service";
import { PricingEngine, PricingEngineRequest } from "../engine";
import { QuoteFactory } from "./quote-factory";
import { QuoteJourneySummary, QuoteQuotationMetadata, QuoteResult, QuoteTravellerSummary } from "./models";
export interface QuoteIntegrationRequest {
    readonly pricingEngineRequest: PricingEngineRequest;
    readonly travellerSummary: QuoteTravellerSummary;
    readonly journeySummary: QuoteJourneySummary;
    readonly quotationMetadata?: QuoteQuotationMetadata;
    readonly requestId?: string;
    readonly source?: string;
}
export declare class QuoteIntegrationService implements ApplicationService<QuoteIntegrationRequest, QuoteResult> {
    private readonly pricingEngine;
    private readonly quoteFactory;
    constructor(pricingEngine: PricingEngine, quoteFactory: QuoteFactory);
    execute(request: QuoteIntegrationRequest): Promise<QuoteResult>;
    private createMetadata;
}
//# sourceMappingURL=quote-integration-service.d.ts.map