import { InvoiceDepositRequirement, InvoiceStatus } from "../../models";
export interface InvoicePaymentFinancialState {
    readonly amountPaid: number;
    readonly balanceDue: number;
    readonly status: InvoiceStatus;
}
export declare class InvoiceFinancialCalculator {
    calculateDepositAmount(totalAmount: number, requirement?: InvoiceDepositRequirement): number;
    applyPayment(input: {
        readonly totalObligation: number;
        readonly previousAmountPaid: number;
        readonly paymentAmount: number;
        readonly previousStatus: InvoiceStatus;
    }): InvoicePaymentFinancialState;
    calculateCancellationState(input: {
        readonly amountPaid: number;
        readonly cancellationCharge: number;
    }): {
        readonly balanceDue: number;
        readonly refundableAmount: number;
    };
    applyRefund(input: {
        readonly totalObligation: number;
        readonly amountPaid: number;
        readonly refundableAmount: number;
        readonly refundAmount: number;
    }): {
        readonly amountPaid: number;
        readonly balanceDue: number;
        readonly refundableAmount: number;
    };
}
//# sourceMappingURL=invoice-financial-calculator.d.ts.map