import { Invoice } from "../../aggregate";
import { InvoiceValidationResult } from "../../validation";
import { InvoiceOperation } from "./invoice-operation";
export interface InvoicePolicyReviewRequirements {
    readonly paymentReviewRequired?: boolean;
    readonly cancellationReviewRequired?: boolean;
    readonly accountingReviewRequired?: boolean;
}
export interface InvoicePolicyContext {
    readonly operation: InvoiceOperation;
    readonly validationResult: InvoiceValidationResult;
    readonly invoice?: Invoice | null;
    readonly reviewRequirements?: InvoicePolicyReviewRequirements;
}
export declare function createInvoicePolicyContext(context: InvoicePolicyContext): InvoicePolicyContext;
//# sourceMappingURL=invoice-policy-context.d.ts.map