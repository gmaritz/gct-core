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

export function createInvoiceSummaryPresentationModel(
  model: InvoiceSummaryPresentationModel,
): InvoiceSummaryPresentationModel {
  return Object.freeze({
    invoiceId: model.invoiceId,
    reservationReference: model.reservationReference,
    customerDisplay: model.customerDisplay,
    status: model.status,
    statusLabel: model.statusLabel,
    issueDate: new Date(model.issueDate.getTime()),
    issueDateDisplay: model.issueDateDisplay,
    dueDate: typeof model.dueDate === "undefined" ? undefined : new Date(model.dueDate.getTime()),
    dueDateDisplay: model.dueDateDisplay,
    total: model.total,
    totalDisplay: model.totalDisplay,
    amountPaid: model.amountPaid,
    amountPaidDisplay: model.amountPaidDisplay,
    balanceDue: model.balanceDue,
    balanceDueDisplay: model.balanceDueDisplay,
    currency: model.currency,
  });
}
