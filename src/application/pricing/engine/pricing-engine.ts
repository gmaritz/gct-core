import { ApplicationService } from "../../application-service";
import { Pricing, PricingComposition } from "../aggregate";
import {
  createPricingCalculationContext,
  PricingCalculationContext,
  PricingCalculationResult,
  PricingCalculatorPipeline,
} from "../calculators";
import {
  createPricingPolicyContext,
  PricingPolicyEvaluation,
  PricingPolicyPipeline,
  PricingStrategySet,
} from "../policies";
import { PricingValidationPipeline } from "../validation";
import {
  createPricingEngineContext,
  createPricingEngineResult,
  PricingEngineRequest,
  PricingEngineResult,
  withEngineCalculationContext,
  withEnginePolicyEvaluation,
  withEnginePricingAggregate,
  withEngineValidationResult,
} from "./models";

function ensurePresent<T>(value: T | null | undefined, message: string): T {
  if (value === null || typeof value === "undefined") {
    throw new Error(message);
  }

  return value;
}

function resolveTravellerCount(request: PricingEngineRequest): number {
  if (typeof request.travellerCount === "number" && request.travellerCount > 0) {
    return request.travellerCount;
  }

  const inferred = (request.pricingRequest.breakdown?.lineItems ?? []).reduce((count, item) => count + item.quantity, 0);
  return inferred > 0 ? inferred : 1;
}

function createInitialCalculationContext(
  request: PricingEngineRequest,
  strategySet: PricingStrategySet,
): PricingCalculationContext {
  return createPricingCalculationContext({
    pricingRequest: request.pricingRequest,
    pricingStrategySet: strategySet,
    currentPricingBreakdown: ensurePresent(request.pricingRequest.breakdown, "Pricing breakdown is required."),
    calculatedTotals: ensurePresent(request.pricingRequest.totals, "Pricing totals are required."),
    currency: ensurePresent(request.pricingRequest.currency, "Pricing currency is required."),
    warnings: Object.freeze([...(strategySet.warnings ?? [])]),
    calculationMetadata: {
      calculatedAt: new Date(),
      version: "1.0.0",
      source: "PricingEngine",
    },
  });
}

function createPricingComposition(
  request: PricingEngineRequest,
  calculationResult: PricingCalculationResult,
  requestId: string,
): PricingComposition {
  const summary = ensurePresent(request.pricingRequest.summary, "Pricing summary is required.");
  const taxes = ensurePresent(request.pricingRequest.taxes, "Pricing taxes are required.");
  const currency = ensurePresent(request.pricingRequest.currency, "Pricing currency is required.");

  const now = new Date();

  return {
    identity: {
      id: `pricing-${requestId}`,
    },
    summary,
    breakdown: calculationResult.breakdown,
    taxes,
    fees: Object.freeze([...(request.pricingRequest.fees ?? [])]),
    discounts: Object.freeze([...(request.pricingRequest.discounts ?? [])]),
    markups: Object.freeze([...(request.pricingRequest.markups ?? [])]),
    commissions: Object.freeze([...(request.pricingRequest.commissions ?? [])]),
    totals: calculationResult.totals,
    currency,
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: "1.0.0",
      source: "PricingEngine",
    },
  };
}

function collectValidationWarnings(validationErrors: ReadonlyArray<{ readonly message: string }>): ReadonlyArray<string> {
  return validationErrors.map((error) => error.message);
}

function toResultMetadata(stages: ReadonlyArray<string>, requestId: string): PricingEngineResult["metadata"] {
  return {
    completedAt: new Date(),
    version: "1.0.0",
    requestId,
    stages: Object.freeze([...(stages ?? [])]),
  };
}

export class PricingEngine implements ApplicationService<PricingEngineRequest, PricingEngineResult> {
  public constructor(
    private readonly validationPipeline: PricingValidationPipeline,
    private readonly policyPipeline: PricingPolicyPipeline,
    private readonly calculatorPipeline: PricingCalculatorPipeline,
  ) {}

  public async execute(request: PricingEngineRequest): Promise<PricingEngineResult> {
    const initialContext = createPricingEngineContext(request);

    const validationResult = this.validationPipeline.execute(initialContext.pricingRequest);
    const validationContext = withEngineValidationResult(initialContext, validationResult);

    if (!validationResult.valid) {
      return createPricingEngineResult({
        successful: false,
        pricing: null,
        warnings: Object.freeze([
          ...validationResult.warnings,
          ...collectValidationWarnings(validationResult.errors),
        ]),
        metadata: toResultMetadata(validationContext.metadata.stages, validationContext.metadata.requestId),
      });
    }

    const policyEvaluation: PricingPolicyEvaluation = this.policyPipeline.evaluate(
      createPricingPolicyContext({
        pricingRequest: initialContext.pricingRequest,
        journeySummary: {
          journeyId: initialContext.pricingRequest.summary?.productId ?? validationContext.metadata.requestId,
          productType: initialContext.pricingRequest.summary?.productType ?? "UNSPECIFIED",
          destination: request.destination,
        },
        travellerInformation: {
          travellerCount: resolveTravellerCount(request),
          residentCountry: request.residentCountry,
        },
        commercialMetadata: Object.freeze({ ...(request.commercialMetadata ?? {}) }),
        market: request.market ?? "UNSPECIFIED",
        salesChannel: request.salesChannel ?? "UNSPECIFIED",
        bookingDate: request.bookingDate ? new Date(request.bookingDate.getTime()) : new Date(),
      }),
    );

    const policyContext = withEnginePolicyEvaluation(validationContext, policyEvaluation);

    if (!policyEvaluation.permitted) {
      return createPricingEngineResult({
        successful: false,
        pricing: null,
        warnings: Object.freeze([...policyEvaluation.warnings, ...policyEvaluation.errors]),
        metadata: toResultMetadata(policyContext.metadata.stages, policyContext.metadata.requestId),
      });
    }

    const initialCalculationContext = createInitialCalculationContext(request, policyEvaluation.strategySet);
    const calculationContext = withEngineCalculationContext(policyContext, initialCalculationContext);

    const calculationResult = this.calculatorPipeline.execute(initialCalculationContext);

    const pricing = Pricing.create(
      createPricingComposition(request, calculationResult, calculationContext.metadata.requestId),
    );

    const completedContext = withEnginePricingAggregate(calculationContext, pricing);

    return createPricingEngineResult({
      successful: true,
      pricing,
      warnings: Object.freeze([
        ...validationResult.warnings,
        ...policyEvaluation.warnings,
        ...calculationResult.warnings,
      ]),
      metadata: toResultMetadata(completedContext.metadata.stages, completedContext.metadata.requestId),
    });
  }
}
