import { PricingEngineResult } from "../engine";
import { PricingBreakdownPresentationModel, PricingSummaryPresentationModel, QuotePresentationModel } from "./models";
export interface PricingPresentationOutput {
    readonly summary: PricingSummaryPresentationModel;
    readonly breakdown: PricingBreakdownPresentationModel;
    readonly quote: QuotePresentationModel;
}
export declare class PricingPresentationMapper {
    map(result: PricingEngineResult): PricingPresentationOutput | null;
}
//# sourceMappingURL=pricing-presentation-mapper.d.ts.map