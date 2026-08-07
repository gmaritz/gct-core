import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyResult } from "./models";

export type CommissionPolicy = PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
