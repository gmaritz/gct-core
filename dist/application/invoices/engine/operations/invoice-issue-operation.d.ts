import { InvoiceOperation } from "../../policies";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
export declare class InvoiceIssueOperation implements InvoiceOperationHandler {
    readonly operation = InvoiceOperation.ISSUE;
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-issue-operation.d.ts.map