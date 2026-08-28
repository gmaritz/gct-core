import { JourneyQuoteResult } from "../../../application/merchandising";
import { PricingViewModelProvider } from "../../../application/pricing";
import { JourneyQuoteViewModel } from "../journeys/journey-quote.viewmodel";
export declare class JourneyQuoteViewModelProvider {
    private readonly pricingProvider;
    constructor(pricingProvider?: PricingViewModelProvider);
    provide(result: JourneyQuoteResult): JourneyQuoteViewModel;
}
//# sourceMappingURL=journey-quote.viewmodel-provider.d.ts.map