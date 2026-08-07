import { Pricing } from "../../aggregate";

export interface PricingEngineResult {
  readonly successful: boolean;
  readonly pricing: Pricing | null;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly stages: ReadonlyArray<string>;
  };
}

export function createPricingEngineResult(input: {
  readonly successful: boolean;
  readonly pricing?: Pricing | null;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly stages: ReadonlyArray<string>;
  };
}): PricingEngineResult {
  return Object.freeze({
    successful: input.successful,
    pricing: input.pricing ?? null,
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      completedAt: new Date(input.metadata.completedAt.getTime()),
      version: input.metadata.version,
      requestId: input.metadata.requestId,
      stages: Object.freeze([...(input.metadata.stages ?? [])]),
    }),
  });
}
