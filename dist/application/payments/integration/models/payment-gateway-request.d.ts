import { PaymentMethod, PaymentReference } from "../../models";
import { PaymentProviderOperation } from "./payment-provider-operation";
import { PaymentGatewayProviderReference } from "./payment-provider-reference";
export interface PaymentGatewayRequestMetadata {
    readonly requestedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
}
export interface PaymentGatewayRequest {
    readonly paymentReference: PaymentReference;
    readonly reservationReference: string;
    readonly providerReference: PaymentGatewayProviderReference;
    readonly operation: PaymentProviderOperation;
    readonly paymentMethod: PaymentMethod;
    readonly currency: string;
    readonly amount: number;
    readonly metadata: PaymentGatewayRequestMetadata;
}
export declare function createPaymentGatewayRequest(request: PaymentGatewayRequest): PaymentGatewayRequest;
//# sourceMappingURL=payment-gateway-request.d.ts.map