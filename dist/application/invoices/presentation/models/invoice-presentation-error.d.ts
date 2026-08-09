export declare enum InvoicePresentationErrorCode {
    MISSING_INPUT = "MISSING_INPUT",
    MISSING_INVOICE = "MISSING_INVOICE",
    ENGINE_RESULT_FAILED = "ENGINE_RESULT_FAILED"
}
export interface InvoicePresentationError {
    readonly code: InvoicePresentationErrorCode;
    readonly message: string;
}
export declare function createInvoicePresentationError(error: InvoicePresentationError): InvoicePresentationError;
//# sourceMappingURL=invoice-presentation-error.d.ts.map