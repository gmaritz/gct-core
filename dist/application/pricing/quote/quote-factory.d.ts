import { Quote } from "../models";
import { QuoteContext, QuoteLifecycle, QuoteReference } from "./models";
export interface QuoteFactoryOutput {
    readonly quote: Quote;
    readonly quoteReference: QuoteReference;
    readonly lifecycle: QuoteLifecycle;
}
export declare class QuoteFactory {
    create(context: QuoteContext): QuoteFactoryOutput;
}
//# sourceMappingURL=quote-factory.d.ts.map