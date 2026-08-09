import { InvoiceExternalReference, InvoiceStatus } from "../../models";
import { InvoiceIntegrationOperation } from "./invoice-integration-operation";
export interface InvoiceExternalPaymentState {
    readonly amountPaid: number;
    readonly balanceDue: number;
    readonly refundableAmount: number;
}
export interface InvoiceExternalCancellationState {
    readonly cancellationDate: Date;
    readonly cancellationCharge: number;
    readonly refundableAmount: number;
}
export interface InvoiceExternalIntegrationRequest {
    readonly operation: InvoiceIntegrationOperation;
    readonly invoiceId: string;
    readonly issueDate: Date;
    readonly dueDate?: Date;
    readonly status: InvoiceStatus;
    readonly customer: {
        readonly customerId?: string;
        readonly travellerId?: string;
    };
    readonly reservationReference: string;
    readonly currency: string;
    readonly totalAmount: number;
    readonly paymentState: InvoiceExternalPaymentState;
    readonly cancellationState?: InvoiceExternalCancellationState;
    readonly externalReferences: ReadonlyArray<InvoiceExternalReference>;
}
export declare function createInvoiceExternalIntegrationRequest(request: InvoiceExternalIntegrationRequest): InvoiceExternalIntegrationRequest;
//# sourceMappingURL=invoice-external-integration-request.d.ts.map