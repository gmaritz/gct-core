import { PaymentPolicyContext, PaymentPolicyResult } from "../models";
import { PaymentPolicy } from "./payment-policy";

export interface SettlementPolicy extends PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> {}
