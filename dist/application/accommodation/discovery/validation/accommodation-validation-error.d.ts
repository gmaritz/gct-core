import { AccommodationValidationErrorCode } from "./accommodation-validation-error-code";
export interface AccommodationValidationError {
    readonly code: AccommodationValidationErrorCode;
    readonly field: string;
    readonly message: string;
}
//# sourceMappingURL=accommodation-validation-error.d.ts.map