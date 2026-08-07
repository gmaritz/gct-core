import { Quote } from "../../models";
import { QuoteLifecycle } from "./quote-lifecycle";
import { QuoteReference } from "./quote-reference";
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
export declare function createQuoteResult(input: {
    readonly successful: boolean;
    readonly quote?: Quote | null;
    readonly quoteReference?: QuoteReference | null;
    readonly lifecycle?: QuoteLifecycle | null;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: QuoteResultMetadata;
}): QuoteResult;
//# sourceMappingURL=quote-result.d.ts.map