import { Pricing } from "../../aggregate";
import { PricingCalculationContext } from "../../calculators";
import { PricingStrategySet, createPricingStrategySet, PricingPolicyEvaluation } from "../../policies";
import { PricingValidationRequest, PricingValidationResult } from "../../validation";

export interface PricingEngineRequest {
  readonly pricingRequest: PricingValidationRequest;
  readonly requestId?: string;
  readonly market?: string;
  readonly salesChannel?: string;
  readonly bookingDate?: Date;
  readonly travellerCount?: number;
  readonly residentCountry?: string;
  readonly destination?: string;
  readonly commercialMetadata?: Readonly<Record<string, string>>;
}

export interface PricingEngineContextMetadata {
  readonly startedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly stages: ReadonlyArray<string>;
}

export interface PricingEngineContext {
  readonly pricingRequest: PricingValidationRequest;
  readonly validationResult?: PricingValidationResult;
  readonly pricingPolicyEvaluation?: PricingPolicyEvaluation;
  readonly pricingStrategySet: PricingStrategySet;
  readonly pricingCalculationContext?: PricingCalculationContext;
  readonly pricingAggregate?: Pricing | null;
  readonly metadata: PricingEngineContextMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function deriveRequestId(request: PricingEngineRequest): string {
  if (request.requestId && request.requestId.trim().length > 0) {
    return request.requestId.trim();
  }

  if (request.pricingRequest.quote?.id) {
    return request.pricingRequest.quote.id;
  }

  if (request.pricingRequest.summary?.productId) {
    return `pricing-${request.pricingRequest.summary.productId}`;
  }

  return "pricing-request";
}

export function createPricingEngineContext(request: PricingEngineRequest): PricingEngineContext {
  return Object.freeze({
    pricingRequest: request.pricingRequest,
    pricingStrategySet: createPricingStrategySet({
      strategies: [],
      warnings: [],
      metadata: {
        generatedAt: new Date(),
        version: "1.0.0",
        source: "PricingEngine",
      },
    }),
    metadata: Object.freeze({
      startedAt: new Date(),
      version: "1.0.0",
      requestId: deriveRequestId(request),
      stages: Object.freeze(["CONTEXT"]),
    }),
  });
}

function withStage(metadata: PricingEngineContextMetadata, stage: string): PricingEngineContextMetadata {
  return Object.freeze({
    startedAt: cloneDate(metadata.startedAt),
    version: metadata.version,
    requestId: metadata.requestId,
    stages: Object.freeze([...metadata.stages, stage]),
  });
}

export function withEngineValidationResult(
  context: PricingEngineContext,
  validationResult: PricingValidationResult,
): PricingEngineContext {
  return Object.freeze({
    ...context,
    validationResult,
    metadata: withStage(context.metadata, "VALIDATION"),
  });
}

export function withEnginePolicyEvaluation(
  context: PricingEngineContext,
  pricingPolicyEvaluation: PricingPolicyEvaluation,
): PricingEngineContext {
  return Object.freeze({
    ...context,
    pricingPolicyEvaluation,
    pricingStrategySet: createPricingStrategySet(pricingPolicyEvaluation.strategySet),
    metadata: withStage(context.metadata, "POLICY"),
  });
}

export function withEngineCalculationContext(
  context: PricingEngineContext,
  pricingCalculationContext: PricingCalculationContext,
): PricingEngineContext {
  return Object.freeze({
    ...context,
    pricingCalculationContext,
    metadata: withStage(context.metadata, "CALCULATION"),
  });
}

export function withEnginePricingAggregate(
  context: PricingEngineContext,
  pricingAggregate: Pricing,
): PricingEngineContext {
  return Object.freeze({
    ...context,
    pricingAggregate,
    metadata: withStage(context.metadata, "AGGREGATE"),
  });
}
