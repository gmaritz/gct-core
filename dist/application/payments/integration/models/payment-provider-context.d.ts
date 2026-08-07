import { Payment } from "../../aggregate";
import { PaymentGatewayRequest } from "./payment-gateway-request";
import { PaymentProviderOperation } from "./payment-provider-operation";
export interface PaymentProviderContextMetadata {
    readonly startedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
}
export interface PaymentProviderContext {
    readonly paymentAggregate: Payment;
    readonly gatewayRequest: PaymentGatewayRequest;
    readonly operation: PaymentProviderOperation;
    readonly metadata: PaymentProviderContextMetadata;
}
export declare function createPaymentProviderContext(context: PaymentProviderContext): PaymentProviderContext;
//# sourceMappingURL=payment-provider-context.d.ts.map