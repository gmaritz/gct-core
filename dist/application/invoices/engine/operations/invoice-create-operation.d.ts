import { InvoiceOperation } from "../../policies";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
export declare class InvoiceCreateOperation implements InvoiceOperationHandler {
    readonly operation = InvoiceOperation.CREATE;
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-create-operation.d.ts.map