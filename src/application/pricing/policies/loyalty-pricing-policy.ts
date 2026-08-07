import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyResult } from "./models";

export type LoyaltyPricingPolicy = PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
