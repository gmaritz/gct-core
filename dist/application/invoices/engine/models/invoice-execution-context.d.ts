import { Invoice } from "../../aggregate";
import { InvoiceEngineContext, InvoiceEngineContextMetadata } from "./invoice-engine-context";
export interface InvoiceExecutionContext {
    readonly operation: InvoiceEngineContext["operation"];
    readonly validationRequest: InvoiceEngineContext["validationRequest"];
    readonly validationResult: InvoiceEngineContext["validationResult"];
    readonly policyEvaluation: InvoiceEngineContext["policyEvaluation"];
    readonly operationInput?: InvoiceEngineContext["operationInput"];
    readonly invoice?: Invoice | null;
    readonly resultingInvoice?: Invoice | null;
    readonly metadata: InvoiceEngineContextMetadata;
}
export declare function createInvoiceExecutionContext(engineContext: InvoiceEngineContext): InvoiceExecutionContext;
export declare function withExecutionResultingInvoice(context: InvoiceExecutionContext, resultingInvoice: Invoice): InvoiceExecutionContext;
//# sourceMappingURL=invoice-execution-context.d.ts.map