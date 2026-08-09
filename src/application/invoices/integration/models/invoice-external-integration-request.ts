import { InvoiceExternalReference, InvoiceStatus, createInvoiceExternalReference } from "../../models";
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

function freezeCancellationState(
  cancellationState: InvoiceExternalCancellationState | undefined,
): InvoiceExternalCancellationState | undefined {
  if (!cancellationState) {
    return undefined;
  }

  return Object.freeze({
    cancellationDate: new Date(cancellationState.cancellationDate.getTime()),
    cancellationCharge: cancellationState.cancellationCharge,
    refundableAmount: cancellationState.refundableAmount,
  });
}

export function createInvoiceExternalIntegrationRequest(
  request: InvoiceExternalIntegrationRequest,
): InvoiceExternalIntegrationRequest {
  return Object.freeze({
    operation: request.operation,
    invoiceId: request.invoiceId,
    issueDate: new Date(request.issueDate.getTime()),
    dueDate: typeof request.dueDate === "undefined" ? undefined : new Date(request.dueDate.getTime()),
    status: request.status,
    customer: Object.freeze({
      customerId: request.customer.customerId,
      travellerId: request.customer.travellerId,
    }),
    reservationReference: request.reservationReference,
    currency: request.currency,
    totalAmount: request.totalAmount,
    paymentState: Object.freeze({
      amountPaid: request.paymentState.amountPaid,
      balanceDue: request.paymentState.balanceDue,
      refundableAmount: request.paymentState.refundableAmount,
    }),
    cancellationState: freezeCancellationState(request.cancellationState),
    externalReferences: Object.freeze(request.externalReferences.map(createInvoiceExternalReference)),
  });
}
