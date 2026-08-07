import { Money } from "../money";
import { QuoteItem } from "./quote-item";
import { QuoteMetadata } from "./quote-metadata";
import { QuoteStatus } from "./quote-status";
export interface Quote {
    readonly id: string;
    readonly status: QuoteStatus;
    readonly items: ReadonlyArray<QuoteItem>;
    readonly total: Money;
    readonly metadata: QuoteMetadata;
}
export declare function createQuote(quote: Quote): Quote;
//# sourceMappingURL=quote.d.ts.map