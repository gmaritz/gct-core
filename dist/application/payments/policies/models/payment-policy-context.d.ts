import { PaymentMetadata, PaymentMethod, PaymentPricingSnapshot, PaymentReservationSnapshot } from "../../models";
import { PaymentValidationRequest } from "../../validation";
export interface PaymentPolicyContext {
    readonly reservationSnapshot: PaymentReservationSnapshot;
    readonly pricingSnapshot: PaymentPricingSnapshot;
    readonly paymentRequest: PaymentValidationRequest;
    readonly paymentMethod: PaymentMethod;
    readonly paymentMetadata: PaymentMetadata;
}
export declare function createPaymentPolicyContext(context: PaymentPolicyContext): PaymentPolicyContext;
//# sourceMappingURL=payment-policy-context.d.ts.map