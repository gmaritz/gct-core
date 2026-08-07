import { PaymentPolicyContext, PaymentPolicyResult } from "../models";
import { PaymentPolicy } from "./payment-policy";

export interface PaymentEligibilityPolicy extends PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> {}
