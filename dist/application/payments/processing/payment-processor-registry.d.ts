import { PaymentProcessor } from "./contracts";
import { PaymentProcessingContext, PaymentProcessorPriority, PaymentProcessingStage, PaymentStageProcessingResult } from "./models";
export interface RegisteredPaymentProcessor {
    readonly name: string;
    readonly stage: PaymentProcessingStage;
    readonly priority: PaymentProcessorPriority;
    readonly processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult>;
}
export declare class PaymentProcessorRegistry {
    private readonly processors;
    private registrationSequence;
    register(name: string, stage: PaymentProcessingStage, processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult>, priority?: PaymentProcessorPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredPaymentProcessor | undefined;
    resolveAll(): ReadonlyArray<RegisteredPaymentProcessor>;
}
//# sourceMappingURL=payment-processor-registry.d.ts.map