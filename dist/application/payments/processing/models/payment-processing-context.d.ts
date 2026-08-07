import { PaymentMetadata, PaymentMethod, PaymentPricingSnapshot, PaymentReservationSnapshot, PaymentState } from "../../models";
export interface PaymentProcessingMetadata extends PaymentMetadata {
    readonly correlationId?: string;
}
export interface PaymentProcessingContext {
    readonly paymentSnapshot: PaymentState;
    readonly reservationSnapshot: PaymentReservationSnapshot;
    readonly pricingSnapshot: PaymentPricingSnapshot;
    readonly paymentMethod: PaymentMethod;
    readonly processingMetadata: PaymentProcessingMetadata;
}
export declare function createPaymentProcessingContext(context: PaymentProcessingContext): PaymentProcessingContext;
//# sourceMappingURL=payment-processing-context.d.ts.map