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

function normalizeValidityDays(validityDays: number | undefined): number {
  if (typeof validityDays !== "number" || !Number.isFinite(validityDays) || validityDays <= 0) {
    return 7;
  }

  return Math.floor(validityDays);
}

function createPricingSummary(result: PricingEngineResult): QuotePricingSummary {
  const pricing = result.pricing;

  if (!pricing) {
    return Object.freeze({
      currency: "UNSPECIFIED",
      subtotal: 0,
      taxes: 0,
      discounts: 0,
      total: 0,
    });
  }

  return Object.freeze({
    currency: pricing.currency,
    subtotal: pricing.totals.subtotal.amount,
    taxes: pricing.totals.taxTotal.amount,
    discounts: pricing.totals.discountTotal.amount,
    total: pricing.totals.grandTotal.amount,
  });
}

export function createQuoteContext(request: QuoteContextRequest): QuoteContext {
  const quotationMetadata = request.quotationMetadata ?? {};

  return Object.freeze({
    pricingEngineResult: request.pricingEngineResult,
    travellerSummary: Object.freeze({
      travellerCount: request.travellerSummary.travellerCount,
      leadTravellerName: request.travellerSummary.leadTravellerName,
    }),
    journeySummary: Object.freeze({
      journeyId: request.journeySummary.journeyId,
      title: request.journeySummary.title,
      destination: request.journeySummary.destination,
      duration: request.journeySummary.duration,
    }),
    pricingSummary: createPricingSummary(request.pricingEngineResult),
    quotationMetadata: Object.freeze({
      quotationNumber: quotationMetadata.quotationNumber,
      externalReference: quotationMetadata.externalReference,
      customerReference: quotationMetadata.customerReference,
      validityDays: normalizeValidityDays(quotationMetadata.validityDays),
      source: quotationMetadata.source,
    }),
    createdAt: new Date(),
    metadata: Object.freeze({
      version: "1.0.0",
      requestId: request.requestId ?? request.pricingEngineResult.metadata.requestId,
      source: request.source ?? "QuoteIntegrationService",
    }),
  });
}
