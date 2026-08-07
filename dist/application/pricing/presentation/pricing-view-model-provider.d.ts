import { PricingEngineResult } from "../engine";
import { PricingBreakdownPresentationModel, PricingSummaryPresentationModel, PricingViewModel, QuotePresentationModel } from "./models";
import { PricingPresentationMapper } from "./pricing-presentation-mapper";
export declare class PricingViewModelProvider {
    private readonly mapper;
    constructor(mapper?: PricingPresentationMapper);
    provideViewModel(summary: PricingSummaryPresentationModel, breakdown: PricingBreakdownPresentationModel, quote: QuotePresentationModel, requestId: string): PricingViewModel;
    mapPricingResultToViewModel(result: PricingEngineResult): PricingViewModel | null;
}
//# sourceMappingURL=pricing-view-model-provider.d.ts.map