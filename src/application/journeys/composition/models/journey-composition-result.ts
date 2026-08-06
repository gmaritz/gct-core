import { Journey } from "@application/journeys/aggregate";

export interface JourneyCompositionResultMetadata {
  readonly generatedAt: Date;
  readonly version: string;
  readonly requestId?: string;
}

export interface JourneyCompositionResult {
  readonly success: boolean;
  readonly payload: Journey | null;
  readonly metadata: JourneyCompositionResultMetadata;
  readonly warnings?: ReadonlyArray<string>;
  readonly errors?: ReadonlyArray<string>;
}

export interface JourneyCompositionResultInput {
  readonly success: boolean;
  readonly payload: Journey | null;
  readonly metadata: JourneyCompositionResultMetadata;
  readonly warnings?: ReadonlyArray<string>;
  readonly errors?: ReadonlyArray<string>;
}

function freezeMetadata(metadata: JourneyCompositionResultMetadata): JourneyCompositionResultMetadata {
  return Object.freeze({
    generatedAt: new Date(metadata.generatedAt),
    version: metadata.version,
    requestId: metadata.requestId,
  });
}

export function createJourneyCompositionResult(
  input: JourneyCompositionResultInput,
): JourneyCompositionResult {
  const warnings = input.warnings && input.warnings.length > 0
    ? Object.freeze([...input.warnings])
    : undefined;
  const errors = input.errors && input.errors.length > 0
    ? Object.freeze([...input.errors])
    : undefined;

  return Object.freeze({
    success: input.success,
    payload: input.payload,
    metadata: freezeMetadata(input.metadata),
    warnings,
    errors,
  });
}