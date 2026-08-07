import { ApplicationService } from "@application/application-service";
import { Payment } from "../aggregate";
import { PaymentPolicyPipeline } from "../policies";
import { PaymentProcessingPipeline } from "../processing";
import { PaymentValidationPipeline } from "../validation";
import { PaymentEngineRequest, PaymentEngineResult, PaymentExecutionContext } from "./models";
export interface PaymentAggregateFactory {
    create(context: PaymentExecutionContext): Payment;
}
export declare class DefaultPaymentAggregateFactory implements PaymentAggregateFactory {
    create(context: PaymentExecutionContext): Payment;
}
export declare class PaymentEngine implements ApplicationService<PaymentEngineRequest, PaymentEngineResult> {
    private readonly validationPipeline;
    private readonly policyPipeline;
    private readonly processingPipeline;
    private readonly aggregateFactory;
    constructor(validationPipeline: PaymentValidationPipeline, policyPipeline: PaymentPolicyPipeline, processingPipeline: PaymentProcessingPipeline, aggregateFactory: PaymentAggregateFactory);
    execute(request: PaymentEngineRequest): Promise<PaymentEngineResult>;
}
//# sourceMappingURL=payment-engine.d.ts.map