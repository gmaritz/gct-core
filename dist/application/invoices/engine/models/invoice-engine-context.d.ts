import { Invoice } from "../../aggregate";
import { InvoiceOperation, InvoicePolicyEvaluation } from "../../policies";
import { InvoiceValidationResult, InvoiceValidationRequest } from "../../validation";
import { InvoiceOperationInput } from "./invoice-operation-input";
export interface InvoiceEngineRequest {
    readonly operation: InvoiceOperation;
    readonly validationRequest: InvoiceValidationRequest;
    readonly validationResult: InvoiceValidationResult;
    readonly policyEvaluation: InvoicePolicyEvaluation;
    readonly operationInput?: InvoiceOperationInput;
    readonly invoice?: Invoice | null;
    readonly requestId?: string;
    readonly source?: string;
}
export interface InvoiceEngineContextMetadata {
    readonly startedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
    readonly stages: ReadonlyArray<string>;
}
export interface InvoiceEngineContext {
    readonly operation: InvoiceOperation;
    readonly validationRequest: InvoiceValidationRequest;
    readonly validationResult: InvoiceValidationResult;
    readonly policyEvaluation: InvoicePolicyEvaluation;
    readonly operationInput?: InvoiceOperationInput;
    readonly invoice?: Invoice | null;
    readonly metadata: InvoiceEngineContextMetadata;
}
export declare function createInvoiceEngineContext(request: InvoiceEngineRequest): InvoiceEngineContext;
export declare function withInvoiceEngineStage(metadata: InvoiceEngineContextMetadata, stage: string): InvoiceEngineContextMetadata;
//# sourceMappingURL=invoice-engine-context.d.ts.map