import { PaymentMetadata, PaymentMethod, PaymentPricingSnapshot, PaymentReference, PaymentStatus, PaymentReservationSnapshot, PaymentProviderReference } from "../../models";
import { PaymentValidationResult } from "../models";
export interface PaymentGatewayContext {
    readonly providerReference?: PaymentProviderReference | null;
    readonly correlationId?: string;
    readonly requestId?: string;
    readonly paymentContextId?: string;
}
export interface PaymentReservationContext {
    readonly exists?: boolean;
    readonly status?: string;
    readonly payable?: boolean;
}
export interface PaymentValidationRequest {
    readonly reference?: PaymentReference | null;
    readonly reservationSnapshot?: PaymentReservationSnapshot | null;
    readonly pricingSnapshot?: PaymentPricingSnapshot | null;
    readonly paymentAmount?: number | null;
    readonly currency?: string | null;
    readonly paymentMethod?: PaymentMethod | null;
    readonly status?: PaymentStatus | null;
    readonly metadata?: PaymentMetadata | null;
    readonly reservationContext?: PaymentReservationContext | null;
    readonly gatewayContext?: PaymentGatewayContext | null;
}
export declare class PaymentRequestValidator {
    validate(request: PaymentValidationRequest | null | undefined): PaymentValidationResult;
}
//# sourceMappingURL=payment-request-validator.d.ts.map