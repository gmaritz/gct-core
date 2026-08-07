import { Pricing } from "../../aggregate";
import { PricingCalculationContext } from "../../calculators";
import { PricingStrategySet, PricingPolicyEvaluation } from "../../policies";
import { PricingValidationRequest, PricingValidationResult } from "../../validation";
export interface PricingEngineRequest {
    readonly pricingRequest: PricingValidationRequest;
    readonly requestId?: string;
    readonly market?: string;
    readonly salesChannel?: string;
    readonly bookingDate?: Date;
    readonly travellerCount?: number;
    readonly residentCountry?: string;
    readonly destination?: string;
    readonly commercialMetadata?: Readonly<Record<string, string>>;
}
export interface PricingEngineContextMetadata {
    readonly startedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly stages: ReadonlyArray<string>;
}
export interface PricingEngineContext {
    readonly pricingRequest: PricingValidationRequest;
    readonly validationResult?: PricingValidationResult;
    readonly pricingPolicyEvaluation?: PricingPolicyEvaluation;
    readonly pricingStrategySet: PricingStrategySet;
    readonly pricingCalculationContext?: PricingCalculationContext;
    readonly pricingAggregate?: Pricing | null;
    readonly metadata: PricingEngineContextMetadata;
}
export declare function createPricingEngineContext(request: PricingEngineRequest): PricingEngineContext;
export declare function withEngineValidationResult(context: PricingEngineContext, validationResult: PricingValidationResult): PricingEngineContext;
export declare function withEnginePolicyEvaluation(context: PricingEngineContext, pricingPolicyEvaluation: PricingPolicyEvaluation): PricingEngineContext;
export declare function withEngineCalculationContext(context: PricingEngineContext, pricingCalculationContext: PricingCalculationContext): PricingEngineContext;
export declare function withEnginePricingAggregate(context: PricingEngineContext, pricingAggregate: Pricing): PricingEngineContext;
//# sourceMappingURL=pricing-engine-context.d.ts.map