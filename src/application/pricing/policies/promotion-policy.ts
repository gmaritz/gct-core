import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyResult } from "./models";

export type PromotionPolicy = PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
