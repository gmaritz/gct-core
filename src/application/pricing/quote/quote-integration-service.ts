import { ApplicationService } from "../../application-service";
import { PricingEngine, PricingEngineRequest, PricingEngineResult } from "../engine";
import { QuoteFactory } from "./quote-factory";
import {
  createQuoteContext,
  createQuoteResult,
  QuoteJourneySummary,
  QuoteQuotationMetadata,
  QuoteResult,
  QuoteTravellerSummary,
} from "./models";

export interface QuoteIntegrationRequest {
  readonly pricingEngineRequest: PricingEngineRequest;
  readonly travellerSummary: QuoteTravellerSummary;
  readonly journeySummary: QuoteJourneySummary;
  readonly quotationMetadata?: QuoteQuotationMetadata;
  readonly requestId?: string;
  readonly source?: string;
}

export class QuoteIntegrationService
  implements ApplicationService<QuoteIntegrationRequest, QuoteResult>
{
  public constructor(
    private readonly pricingEngine: PricingEngine,
    private readonly quoteFactory: QuoteFactory,
  ) {}

  public async execute(request: QuoteIntegrationRequest): Promise<QuoteResult> {
    const pricingEngineResult = await this.pricingEngine.execute(request.pricingEngineRequest);

    if (!pricingEngineResult.successful || !pricingEngineResult.pricing) {
      return createQuoteResult({
        successful: false,
        warnings: pricingEngineResult.warnings,
        metadata: this.createMetadata(pricingEngineResult, request),
      });
    }

    const context = createQuoteContext({
      pricingEngineResult,
      travellerSummary: request.travellerSummary,
      journeySummary: request.journeySummary,
      quotationMetadata: request.quotationMetadata,
      requestId: request.requestId,
      source: request.source,
    });

    const output = this.quoteFactory.create(context);

    return createQuoteResult({
      successful: true,
      quote: output.quote,
      quoteReference: output.quoteReference,
      lifecycle: output.lifecycle,
      warnings: pricingEngineResult.warnings,
      metadata: this.createMetadata(pricingEngineResult, request),
    });
  }

  private createMetadata(
    pricingEngineResult: PricingEngineResult,
    request: QuoteIntegrationRequest,
  ): QuoteResult["metadata"] {
    return {
      generatedAt: new Date(),
      version: "1.0.0",
      requestId: request.requestId ?? pricingEngineResult.metadata.requestId,
      source: request.source ?? "QuoteIntegrationService",
    };
  }
}
