import { PaymentPolicyContext, PaymentPolicyResult } from "../models";
import { PaymentPolicy } from "./payment-policy";

export interface AuthorizationPolicy extends PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> {}
