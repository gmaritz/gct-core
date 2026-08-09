import { InvoiceValidationResult } from "./models";
import { CommercialValidator, FinancialIntegrityValidator, InvoiceRequestValidator, InvoiceValidationRequest, LifecycleReadinessValidator, ReservationValidator } from "./validators";
export declare class InvoiceValidationPipeline {
    private readonly requestValidator;
    private readonly reservationValidator;
    private readonly commercialValidator;
    private readonly financialIntegrityValidator;
    private readonly lifecycleReadinessValidator;
    constructor(requestValidator: InvoiceRequestValidator, reservationValidator: ReservationValidator, commercialValidator: CommercialValidator, financialIntegrityValidator: FinancialIntegrityValidator, lifecycleReadinessValidator: LifecycleReadinessValidator);
    execute(request: InvoiceValidationRequest): InvoiceValidationResult;
    private hasCriticalErrors;
    private aggregateResult;
}
//# sourceMappingURL=invoice-validation-pipeline.d.ts.map