import { PaymentPolicyContext, PaymentPolicyResult } from "../models";
import { PaymentPolicy } from "./payment-policy";

export interface PaymentMethodPolicy extends PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> {}
