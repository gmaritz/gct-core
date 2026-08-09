import { InvoiceOperation } from "../../policies";
import { InvoiceFinancialCalculator } from "../calculations";
import { InvoiceExecutionContext, InvoiceOperationExecution } from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
export declare class InvoicePaymentOperation implements InvoiceOperationHandler {
    private readonly calculator;
    readonly operation = InvoiceOperation.ACCEPT_PAYMENT;
    constructor(calculator?: InvoiceFinancialCalculator);
    execute(context: InvoiceExecutionContext): InvoiceOperationExecution;
}
//# sourceMappingURL=invoice-payment-operation.d.ts.map