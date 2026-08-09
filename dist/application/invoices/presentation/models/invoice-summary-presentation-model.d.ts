import { InvoiceStatus } from "../../models";
export interface InvoiceSummaryPresentationModel {
    readonly invoiceId: string;
    readonly reservationReference: string;
    readonly customerDisplay: string;
    readonly status: InvoiceStatus;
    readonly statusLabel: string;
    readonly issueDate: Date;
    readonly issueDateDisplay: string;
    readonly dueDate?: Date;
    readonly dueDateDisplay?: string;
    readonly total: number;
    readonly totalDisplay: string;
    readonly amountPaid: number;
    readonly amountPaidDisplay: string;
    readonly balanceDue: number;
    readonly balanceDueDisplay: string;
    readonly currency: string;
}
export declare function createInvoiceSummaryPresentationModel(model: InvoiceSummaryPresentationModel): InvoiceSummaryPresentationModel;
//# sourceMappingURL=invoice-summary-presentation-model.d.ts.map