import { InvoiceValidationError } from "./invoice-validation-error";
import { InvoiceValidationStage } from "./invoice-validation-stage";
export interface InvoiceValidationResultMetadata {
    readonly validatedAt: Date;
    readonly version: string;
    readonly source: string;
}
export interface InvoiceValidationResult {
    readonly success: boolean;
    readonly stage: InvoiceValidationStage;
    readonly errors: ReadonlyArray<InvoiceValidationError>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: InvoiceValidationResultMetadata;
}
export declare function createInvoiceValidationResult(input: {
    readonly stage: InvoiceValidationStage;
    readonly errors?: ReadonlyArray<InvoiceValidationError>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: InvoiceValidationResultMetadata;
}): InvoiceValidationResult;
//# sourceMappingURL=invoice-validation-result.d.ts.map