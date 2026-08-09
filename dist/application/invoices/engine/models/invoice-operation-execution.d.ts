import { Invoice } from "../../aggregate";
import { InvoiceFinancialImpact } from "./invoice-engine-result";
import { InvoiceEngineError } from "./invoice-engine-error";
export interface InvoiceOperationExecution {
    readonly success: boolean;
    readonly invoice?: Invoice;
    readonly financialImpact?: InvoiceFinancialImpact;
    readonly errors: ReadonlyArray<InvoiceEngineError>;
    readonly warnings: ReadonlyArray<string>;
}
export declare function createInvoiceOperationExecution(input: {
    readonly success: boolean;
    readonly invoice?: Invoice;
    readonly financialImpact?: InvoiceFinancialImpact;
    readonly errors?: ReadonlyArray<InvoiceEngineError>;
    readonly warnings?: ReadonlyArray<string>;
}): InvoiceOperationExecution;
//# sourceMappingURL=invoice-operation-execution.d.ts.map