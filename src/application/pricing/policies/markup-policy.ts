import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyResult } from "./models";

export type MarkupPolicy = PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
