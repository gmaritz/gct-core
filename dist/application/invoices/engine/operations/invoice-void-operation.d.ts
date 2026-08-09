import { InvoiceOperation } from "../../policies";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
export declare class InvoiceVoidOperation implements InvoiceOperationHandler {
    readonly operation = InvoiceOperation.VOID;
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-void-operation.d.ts.map