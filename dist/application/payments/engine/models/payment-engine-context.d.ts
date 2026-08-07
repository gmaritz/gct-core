import { PaymentValidationRequest } from "../../validation";
export interface PaymentEngineRequest {
    readonly paymentRequest: PaymentValidationRequest;
    readonly requestId?: string;
    readonly source?: string;
}
export interface PaymentEngineContextMetadata {
    readonly startedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
    readonly stages: ReadonlyArray<string>;
}
export interface PaymentEngineContext {
    readonly paymentRequest: PaymentValidationRequest;
    readonly metadata: PaymentEngineContextMetadata;
}
export declare function createPaymentEngineContext(request: PaymentEngineRequest): PaymentEngineContext;
export declare function withEngineStage(metadata: PaymentEngineContextMetadata, stage: string): PaymentEngineContextMetadata;
//# sourceMappingURL=payment-engine-context.d.ts.map