import { InvoiceOperation } from "../../policies";
import { InvoiceFinancialCalculator } from "../calculations";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
export declare class InvoiceRefundOperation implements InvoiceOperationHandler {
    private readonly calculator;
    readonly operation = InvoiceOperation.REFUND;
    constructor(calculator?: InvoiceFinancialCalculator);
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-refund-operation.d.ts.map