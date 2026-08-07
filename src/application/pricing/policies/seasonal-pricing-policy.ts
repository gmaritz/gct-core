import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyResult } from "./models";

export type SeasonalPricingPolicy = PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
