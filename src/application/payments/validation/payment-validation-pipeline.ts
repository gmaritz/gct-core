import {
  createPaymentValidationResult,
  PaymentValidationError,
  PaymentValidationResult,
  PaymentValidationStage,
} from "./models";
import {
  GatewayReadinessValidator,
  PaymentRequestValidator,
  PaymentValidationRequest,
  PricingValidator,
  ReservationValidator,
  SettlementReadinessValidator,
} from "./validators";

export class PaymentValidationPipeline {
  public constructor(
    private readonly requestValidator: PaymentRequestValidator,
    private readonly reservationValidator: ReservationValidator,
    private readonly pricingValidator: PricingValidator,
    private readonly settlementReadinessValidator: SettlementReadinessValidator,
    private readonly gatewayReadinessValidator: GatewayReadinessValidator,
  ) {}

  public execute(request: PaymentValidationRequest): PaymentValidationResult {
    const stageResults: PaymentValidationResult[] = [];

    const requestResult = this.requestValidator.validate(request);
    stageResults.push(requestResult);
    if (this.hasCriticalErrors(requestResult.errors)) {
      return this.aggregateResult(PaymentValidationStage.REQUEST, stageResults);
    }

    const reservationResult = this.reservationValidator.validate(request);
    stageResults.push(reservationResult);
    if (this.hasCriticalErrors(reservationResult.errors)) {
      return this.aggregateResult(PaymentValidationStage.RESERVATION, stageResults);
    }

    const pricingResult = this.pricingValidator.validate(request);
    stageResults.push(pricingResult);
    if (this.hasCriticalErrors(pricingResult.errors)) {
      return this.aggregateResult(PaymentValidationStage.PRICING, stageResults);
    }

    const settlementReadinessResult = this.settlementReadinessValidator.validate(request);
    stageResults.push(settlementReadinessResult);
    if (this.hasCriticalErrors(settlementReadinessResult.errors)) {
      return this.aggregateResult(PaymentValidationStage.SETTLEMENT_READINESS, stageResults);
    }

    const gatewayReadinessResult = this.gatewayReadinessValidator.validate(request);
    stageResults.push(gatewayReadinessResult);

    return this.aggregateResult(PaymentValidationStage.GATEWAY_READINESS, stageResults);
  }

  private hasCriticalErrors(errors: ReadonlyArray<PaymentValidationError>): boolean {
    return errors.some((error) => error.severity === "CRITICAL");
  }

  private aggregateResult(
    stage: PaymentValidationStage,
    stageResults: ReadonlyArray<PaymentValidationResult>,
  ): PaymentValidationResult {
    return createPaymentValidationResult({
      stage,
      errors: stageResults.flatMap((result) => result.errors),
      warnings: stageResults.flatMap((result) => result.warnings),
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "PaymentValidationPipeline",
      },
    });
  }
}
