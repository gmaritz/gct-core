import { InvoiceValidationErrorCode } from "./invoice-validation-error-code";
import { InvoiceValidationStage } from "./invoice-validation-stage";
export type InvoiceValidationSeverity = "CRITICAL" | "WARNING";
export interface InvoiceValidationError {
    readonly stage: InvoiceValidationStage;
    readonly code: InvoiceValidationErrorCode;
    readonly message: string;
    readonly severity: InvoiceValidationSeverity;
}
export declare function createInvoiceValidationError(error: InvoiceValidationError): InvoiceValidationError;
//# sourceMappingURL=invoice-validation-error.d.ts.map