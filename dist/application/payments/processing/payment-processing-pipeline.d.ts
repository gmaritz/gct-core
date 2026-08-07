import { PaymentProcessingContext, PaymentProcessingResult } from "./models";
import { PaymentProcessorRegistry } from "./payment-processor-registry";
export declare class PaymentProcessingPipeline {
    private readonly registry;
    constructor(registry?: PaymentProcessorRegistry);
    execute(context: PaymentProcessingContext): PaymentProcessingResult;
}
//# sourceMappingURL=payment-processing-pipeline.d.ts.map