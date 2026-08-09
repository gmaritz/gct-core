import { InvoiceOperation } from "../../policies";
import { InvoiceFinancialCalculator } from "../calculations";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
export declare class InvoiceCancellationOperation implements InvoiceOperationHandler {
    private readonly calculator;
    readonly operation = InvoiceOperation.CANCEL;
    constructor(calculator?: InvoiceFinancialCalculator);
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-cancellation-operation.d.ts.map