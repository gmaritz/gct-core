import { AuthorizationStatus, CaptureStatus, PaymentStatus, SettlementStatus, TransactionReference } from "../../models";
import { PaymentProviderOperation } from "./payment-provider-operation";
import { PaymentGatewayProviderReference } from "./payment-provider-reference";
export interface PaymentGatewayResultMetadata {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
    readonly operation: PaymentProviderOperation;
}
export interface PaymentGatewayResult {
    readonly success: boolean;
    readonly providerReference: PaymentGatewayProviderReference | null;
    readonly transactionReference: TransactionReference | null;
    readonly authorizationStatus: AuthorizationStatus | null;
    readonly captureStatus: CaptureStatus | null;
    readonly settlementStatus: SettlementStatus | null;
    readonly paymentStatus: PaymentStatus | null;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: PaymentGatewayResultMetadata;
}
export declare function createPaymentGatewayResult(result: PaymentGatewayResult): PaymentGatewayResult;
//# sourceMappingURL=payment-gateway-result.d.ts.map