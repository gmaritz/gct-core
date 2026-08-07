import { PricingValidationRequest } from "../../validation";
export interface PricingPolicyContext {
    readonly pricingRequest: PricingValidationRequest;
    readonly journeySummary: {
        readonly journeyId: string;
        readonly productType: string;
        readonly destination?: string;
    };
    readonly travellerInformation: {
        readonly travellerCount: number;
        readonly residentCountry?: string;
    };
    readonly commercialMetadata: Readonly<Record<string, string>>;
    readonly market: string;
    readonly salesChannel: string;
    readonly bookingDate: Date;
}
export declare function createPricingPolicyContext(context: PricingPolicyContext): PricingPolicyContext;
//# sourceMappingURL=pricing-policy-context.d.ts.map