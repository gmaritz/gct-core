export interface PricingBreakdownPresentationModel {
    readonly accommodationSubtotal: number;
    readonly experiencesSubtotal: number;
    readonly taxes: number;
    readonly fees: number;
    readonly discounts: number;
    readonly markups: number;
    readonly commissions: number;
    readonly grandTotal: number;
    readonly currency: string;
}
export declare function createPricingBreakdownPresentationModel(model: PricingBreakdownPresentationModel): PricingBreakdownPresentationModel;
//# sourceMappingURL=pricing-breakdown-presentation-model.d.ts.map