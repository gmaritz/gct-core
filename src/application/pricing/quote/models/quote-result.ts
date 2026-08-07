import { createQuote, Quote } from "../../models";
import { createQuoteLifecycle, QuoteLifecycle } from "./quote-lifecycle";
import { createQuoteReference, QuoteReference } from "./quote-reference";

export interface QuoteResultMetadata {
  readonly generatedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly source: string;
}

export interface QuoteResult {
  readonly successful: boolean;
  readonly quote: Quote | null;
  readonly quoteReference: QuoteReference | null;
  readonly lifecycle: QuoteLifecycle | null;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: QuoteResultMetadata;
}

export function createQuoteResult(input: {
  readonly successful: boolean;
  readonly quote?: Quote | null;
  readonly quoteReference?: QuoteReference | null;
  readonly lifecycle?: QuoteLifecycle | null;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: QuoteResultMetadata;
}): QuoteResult {
  return Object.freeze({
    successful: input.successful,
    quote: input.quote ? createQuote(input.quote) : null,
    quoteReference: input.quoteReference ? createQuoteReference(input.quoteReference) : null,
    lifecycle: input.lifecycle ? createQuoteLifecycle(input.lifecycle) : null,
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      generatedAt: new Date(input.metadata.generatedAt.getTime()),
      version: input.metadata.version,
      requestId: input.metadata.requestId,
      source: input.metadata.source,
    }),
  });
}
