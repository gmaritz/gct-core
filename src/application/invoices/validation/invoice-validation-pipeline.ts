import {
  createInvoiceValidationResult,
  InvoiceValidationError,
  InvoiceValidationResult,
  InvoiceValidationStage,
} from "./models";
import {
  CommercialValidator,
  FinancialIntegrityValidator,
  InvoiceRequestValidator,
  InvoiceValidationRequest,
  LifecycleReadinessValidator,
  ReservationValidator,
} from "./validators";

export class InvoiceValidationPipeline {
  public constructor(
    private readonly requestValidator: InvoiceRequestValidator,
    private readonly reservationValidator: ReservationValidator,
    private readonly commercialValidator: CommercialValidator,
    private readonly financialIntegrityValidator: FinancialIntegrityValidator,
    private readonly lifecycleReadinessValidator: LifecycleReadinessValidator,
  ) {}

  public execute(request: InvoiceValidationRequest): InvoiceValidationResult {
    const stageResults: InvoiceValidationResult[] = [];

    const requestResult = this.requestValidator.validate(request);
    stageResults.push(requestResult);
    if (this.hasCriticalErrors(requestResult.errors)) {
      return this.aggregateResult(InvoiceValidationStage.REQUEST, stageResults);
    }

    const reservationResult = this.reservationValidator.validate(request);
    stageResults.push(reservationResult);
    if (this.hasCriticalErrors(reservationResult.errors)) {
      return this.aggregateResult(InvoiceValidationStage.RESERVATION, stageResults);
    }

    const commercialResult = this.commercialValidator.validate(request);
    stageResults.push(commercialResult);
    if (this.hasCriticalErrors(commercialResult.errors)) {
      return this.aggregateResult(InvoiceValidationStage.COMMERCIAL, stageResults);
    }

    const financialResult = this.financialIntegrityValidator.validate(request);
    stageResults.push(financialResult);
    if (this.hasCriticalErrors(financialResult.errors)) {
      return this.aggregateResult(InvoiceValidationStage.FINANCIAL_INTEGRITY, stageResults);
    }

    const lifecycleResult = this.lifecycleReadinessValidator.validate(request);
    stageResults.push(lifecycleResult);

    return this.aggregateResult(InvoiceValidationStage.LIFECYCLE_READINESS, stageResults);
  }

  private hasCriticalErrors(errors: ReadonlyArray<InvoiceValidationError>): boolean {
    return errors.some((error) => error.severity === "CRITICAL");
  }

  private aggregateResult(
    stage: InvoiceValidationStage,
    stageResults: ReadonlyArray<InvoiceValidationResult>,
  ): InvoiceValidationResult {
    return createInvoiceValidationResult({
      stage,
      errors: stageResults.flatMap((result) => result.errors),
      warnings: stageResults.flatMap((result) => result.warnings),
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "InvoiceValidationPipeline",
      },
    });
  }
}