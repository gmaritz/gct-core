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
export declare function createJourneyCompositionResult(input: JourneyCompositionResultInput): JourneyCompositionResult;
//# sourceMappingURL=journey-composition-result.d.ts.map