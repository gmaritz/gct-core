import { JourneyValidationError } from "./journey-validation-error";
export interface JourneyValidationResult {
    readonly valid: boolean;
    readonly errors: ReadonlyArray<JourneyValidationError>;
}
export declare function createJourneyValidationResult(errors: ReadonlyArray<JourneyValidationError>): JourneyValidationResult;
//# sourceMappingURL=journey-validation-result.d.ts.map