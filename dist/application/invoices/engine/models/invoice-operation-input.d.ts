import { InvoiceComposition } from "../../aggregate";
import { InvoiceOperation } from "../../policies";
export interface InvoiceCreateOperationInput {
    readonly operation: InvoiceOperation.CREATE;
    readonly composition: InvoiceComposition;
}
export interface InvoiceIssueOperationInput {
    readonly operation: InvoiceOperation.ISSUE;
    readonly issuedAt?: Date;
}
export interface InvoicePaymentOperationInput {
    readonly operation: InvoiceOperation.ACCEPT_PAYMENT;
    readonly paymentId: string;
    readonly amount: number;
    readonly currency: string;
    readonly allocatedAt?: Date;
    readonly externalReference?: string;
}
export interface InvoiceCancellationOperationInput {
    readonly operation: InvoiceOperation.CANCEL;
    readonly policyReference: string;
    readonly policyVersion?: string;
    readonly effectiveFrom?: Date;
    readonly effectiveTo?: Date;
    readonly cancellationDate: Date;
    readonly cancellationCharge: number;
    readonly reason?: string;
    readonly adjustmentId?: string;
}
export interface InvoiceVoidOperationInput {
    readonly operation: InvoiceOperation.VOID;
    readonly reason?: string;
}
export interface InvoiceRefundOperationInput {
    readonly operation: InvoiceOperation.REFUND;
    readonly amount: number;
    readonly refundedAt?: Date;
    readonly reason?: string;
    readonly adjustmentId?: string;
}
export type InvoiceOperationInput = InvoiceCreateOperationInput | InvoiceIssueOperationInput | InvoicePaymentOperationInput | InvoiceCancellationOperationInput | InvoiceVoidOperationInput | InvoiceRefundOperationInput;
//# sourceMappingURL=invoice-operation-input.d.ts.map