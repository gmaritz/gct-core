import { createMoney, Money } from "../money";
import { createQuoteItem, QuoteItem } from "./quote-item";
import { createQuoteMetadata, QuoteMetadata } from "./quote-metadata";
import { QuoteStatus } from "./quote-status";

export interface Quote {
  readonly id: string;
  readonly status: QuoteStatus;
  readonly items: ReadonlyArray<QuoteItem>;
  readonly total: Money;
  readonly metadata: QuoteMetadata;
}

export function createQuote(quote: Quote): Quote {
  return Object.freeze({
    id: quote.id,
    status: quote.status,
    items: Object.freeze(quote.items.map(createQuoteItem)),
    total: createMoney(quote.total),
    metadata: createQuoteMetadata(quote.metadata),
  });
}
