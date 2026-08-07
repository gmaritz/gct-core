import { createQuote, createQuoteItem, createQuoteMetadata, Quote, QuoteStatus } from "../models";
import {
  createQuoteLifecycle,
  createQuoteReference,
  QuoteContext,
  QuoteLifecycle,
  QuoteReference,
} from "./models";

export interface QuoteFactoryOutput {
  readonly quote: Quote;
  readonly quoteReference: QuoteReference;
  readonly lifecycle: QuoteLifecycle;
}

function resolveQuotationNumber(context: QuoteContext): string {
  if (context.quotationMetadata.quotationNumber) {
    return context.quotationMetadata.quotationNumber;
  }

  return `Q-${context.metadata.requestId}-${context.createdAt.getTime()}`;
}

function resolveExpiresAt(createdAt: Date, validityDays: number | undefined): Date {
  const expiresAt = new Date(createdAt.getTime());
  expiresAt.setDate(expiresAt.getDate() + (validityDays ?? 7));

  return expiresAt;
}

export class QuoteFactory {
  public create(context: QuoteContext): QuoteFactoryOutput {
    if (!context.pricingEngineResult.successful || !context.pricingEngineResult.pricing) {
      throw new Error("Cannot create quote from unsuccessful pricing result.");
    }

    const pricing = context.pricingEngineResult.pricing;

    const quoteReference = createQuoteReference({
      quotationNumber: resolveQuotationNumber(context),
      externalReference: context.quotationMetadata.externalReference,
      customerReference: context.quotationMetadata.customerReference,
    });

    const expiresAt = resolveExpiresAt(context.createdAt, context.quotationMetadata.validityDays);

    const lifecycle = createQuoteLifecycle({
      createdAt: context.createdAt,
      expiresAt,
    });

    const quote = createQuote({
      id: quoteReference.quotationNumber,
      status: QuoteStatus.DRAFT,
      items: pricing.breakdown.lineItems.map((lineItem) =>
        createQuoteItem({
          code: lineItem.code,
          label: lineItem.label,
          amount: lineItem.totalAmount,
          quantity: lineItem.quantity,
        }),
      ),
      total: pricing.totals.grandTotal,
      metadata: createQuoteMetadata({
        createdAt: lifecycle.createdAt,
        expiresAt: lifecycle.expiresAt,
        version: "1.0.0",
        source: context.quotationMetadata.source ?? "QuoteFactory",
      }),
    });

    return Object.freeze({
      quote,
      quoteReference,
      lifecycle,
    });
  }
}
