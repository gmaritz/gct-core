import { PaymentProcessingContext } from "./payment-processing-context";
import { PaymentProcessingStage } from "./payment-processing-stage";
import { PaymentProcessingStatus } from "./payment-processing-status";
export interface PaymentStageProcessingResult {
    readonly processorName: string;
    readonly stage: PaymentProcessingStage;
    readonly status: PaymentProcessingStatus;
    readonly context: PaymentProcessingContext;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly processedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export interface PaymentProcessingResult {
    readonly success: boolean;
    readonly stageResults: ReadonlyArray<PaymentStageProcessingResult>;
    readonly finalContext: PaymentProcessingContext;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly processedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export declare function createPaymentStageProcessingResult(result: PaymentStageProcessingResult): PaymentStageProcessingResult;
export declare function createPaymentProcessingResult(result: PaymentProcessingResult): PaymentProcessingResult;
//# sourceMappingURL=payment-processing-result.d.ts.map