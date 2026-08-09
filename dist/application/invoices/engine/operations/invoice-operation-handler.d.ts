import { InvoiceOperation } from "../../policies";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
export interface InvoiceOperationHandler {
    readonly operation: InvoiceOperation;
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-operation-handler.d.ts.map