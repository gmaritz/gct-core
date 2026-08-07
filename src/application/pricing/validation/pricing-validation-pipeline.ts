import {
  createPricingValidationResult,
  PricingValidationError,
  PricingValidationResult,
  PricingValidationStage,
} from "./models";
import { CommercialValidator } from "./commercial-validator";
import { PricingIntegrityValidator } from "./pricing-integrity-validator";
import { PricingRequestValidator, PricingValidationRequest } from "./pricing-request-validator";
import { QuoteReadinessValidator } from "./quote-readiness-validator";

export interface PricingValidationPipelineDependencies {
  readonly requestValidator: PricingRequestValidator;
  readonly commercialValidator: CommercialValidator;
  readonly integrityValidator: PricingIntegrityValidator;
  readonly quoteReadinessValidator: QuoteReadinessValidator;
}

export class PricingValidationPipeline {
  public constructor(private readonly dependencies: PricingValidationPipelineDependencies) {}

  public execute(request: PricingValidationRequest): PricingValidationResult {
    const results: PricingValidationResult[] = [];

    const requestResult = this.dependencies.requestValidator.validate(request);
    results.push(requestResult);
    if (this.hasCriticalErrors(requestResult.errors)) {
      return this.aggregateResults(PricingValidationStage.REQUEST, results);
    }

    const commercialResult = this.dependencies.commercialValidator.validate(request);
    results.push(commercialResult);
    if (this.hasCriticalErrors(commercialResult.errors)) {
      return this.aggregateResults(PricingValidationStage.COMMERCIAL, results);
    }

    const integrityResult = this.dependencies.integrityValidator.validate(request);
    results.push(integrityResult);
    if (this.hasCriticalErrors(integrityResult.errors)) {
      return this.aggregateResults(PricingValidationStage.INTEGRITY, results);
    }

    const quoteReadinessResult = this.dependencies.quoteReadinessValidator.validate(request);
    results.push(quoteReadinessResult);

    return this.aggregateResults(PricingValidationStage.QUOTE_READINESS, results);
  }

  private hasCriticalErrors(errors: ReadonlyArray<PricingValidationError>): boolean {
    return errors.some((error) => error.critical);
  }

  private aggregateResults(
    stage: PricingValidationStage,
    stageResults: ReadonlyArray<PricingValidationResult>,
  ): PricingValidationResult {
    return createPricingValidationResult({
      stage,
      errors: stageResults.flatMap((result) => result.errors),
      warnings: stageResults.flatMap((result) => result.warnings),
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "PricingValidationPipeline",
      },
    });
  }
}
