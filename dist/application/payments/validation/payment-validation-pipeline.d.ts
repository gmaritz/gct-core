import { PaymentValidationResult } from "./models";
import { GatewayReadinessValidator, PaymentRequestValidator, PaymentValidationRequest, PricingValidator, ReservationValidator, SettlementReadinessValidator } from "./validators";
export declare class PaymentValidationPipeline {
    private readonly requestValidator;
    private readonly reservationValidator;
    private readonly pricingValidator;
    private readonly settlementReadinessValidator;
    private readonly gatewayReadinessValidator;
    constructor(requestValidator: PaymentRequestValidator, reservationValidator: ReservationValidator, pricingValidator: PricingValidator, settlementReadinessValidator: SettlementReadinessValidator, gatewayReadinessValidator: GatewayReadinessValidator);
    execute(request: PaymentValidationRequest): PaymentValidationResult;
    private hasCriticalErrors;
    private aggregateResult;
}
//# sourceMappingURL=payment-validation-pipeline.d.ts.map