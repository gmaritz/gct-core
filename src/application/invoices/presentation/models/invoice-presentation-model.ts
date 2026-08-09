import { InvoiceStatus } from "../../models";
import {
  createInvoiceAdjustmentPresentationModel,
  InvoiceAdjustmentPresentationModel,
} from "./invoice-adjustment-presentation-model";
import {
  createInvoiceCancellationPresentationModel,
  InvoiceCancellationPresentationModel,
} from "./invoice-cancellation-presentation-model";
import {
  createInvoicePaymentPresentationModel,
  InvoicePaymentPresentationModel,
} from "./invoice-payment-presentation-model";

export interface InvoiceDepositPresentationModel {
  readonly type: string;
  readonly value: number;
  readonly valueDisplay: string;
}

export interface InvoiceExternalReferencePresentationModel {
  readonly system: string;
  readonly reference: string;
}

export interface InvoicePresentationModel {
  readonly invoiceId: string;
  readonly status: InvoiceStatus;
  readonly statusLabel: string;
  readonly reservationReference: string;
  readonly customerReference: {
    readonly customerId?: string;
    readonly travellerId?: string;
    readonly display: string;
  };
  readonly quoteReference: {
    readonly quoteId: string;
    readonly quoteVersion: string;
  };
  readonly pricing: {
    readonly snapshotId: string;
    readonly pricingId: string;
    readonly capturedAt: Date;
    readonly capturedAtDisplay: string;
    readonly version: string;
    readonly totalAmount: number;
    readonly totalAmountDisplay: string;
    readonly currency: string;
  };
  readonly financial: {
    readonly totalObligation: number;
    readonly totalObligationDisplay: string;
    readonly amountPaid: number;
    readonly amountPaidDisplay: string;
    readonly balanceDue: number;
    readonly balanceDueDisplay: string;
    readonly refundableAmount: number;
    readonly refundableAmountDisplay: string;
    readonly currency: string;
  };
  readonly dueDate?: Date;
  readonly dueDateDisplay?: string;
  readonly deposit?: InvoiceDepositPresentationModel;
  readonly payments: ReadonlyArray<InvoicePaymentPresentationModel>;
  readonly adjustments: ReadonlyArray<InvoiceAdjustmentPresentationModel>;
  readonly cancellation?: InvoiceCancellationPresentationModel;
  readonly externalReferences: ReadonlyArray<InvoiceExternalReferencePresentationModel>;
  readonly metadata: {
    readonly createdAt: Date;
    readonly createdAtDisplay: string;
    readonly updatedAt: Date;
    readonly updatedAtDisplay: string;
    readonly version: string;
  };
}

function freezeDeposit(
  deposit: InvoiceDepositPresentationModel | undefined,
): InvoiceDepositPresentationModel | undefined {
  if (!deposit) {
    return undefined;
  }

  return Object.freeze({
    type: deposit.type,
    value: deposit.value,
    valueDisplay: deposit.valueDisplay,
  });
}

function freezeExternalReferences(
  references: ReadonlyArray<InvoiceExternalReferencePresentationModel>,
): ReadonlyArray<InvoiceExternalReferencePresentationModel> {
  return Object.freeze(
    references.map((reference) =>
      Object.freeze({
        system: reference.system,
        reference: reference.reference,
      }),
    ),
  );
}

export function createInvoicePresentationModel(model: InvoicePresentationModel): InvoicePresentationModel {
  return Object.freeze({
    invoiceId: model.invoiceId,
    status: model.status,
    statusLabel: model.statusLabel,
    reservationReference: model.reservationReference,
    customerReference: Object.freeze({
      customerId: model.customerReference.customerId,
      travellerId: model.customerReference.travellerId,
      display: model.customerReference.display,
    }),
    quoteReference: Object.freeze({
      quoteId: model.quoteReference.quoteId,
      quoteVersion: model.quoteReference.quoteVersion,
    }),
    pricing: Object.freeze({
      snapshotId: model.pricing.snapshotId,
      pricingId: model.pricing.pricingId,
      capturedAt: new Date(model.pricing.capturedAt.getTime()),
      capturedAtDisplay: model.pricing.capturedAtDisplay,
      version: model.pricing.version,
      totalAmount: model.pricing.totalAmount,
      totalAmountDisplay: model.pricing.totalAmountDisplay,
      currency: model.pricing.currency,
    }),
    financial: Object.freeze({
      totalObligation: model.financial.totalObligation,
      totalObligationDisplay: model.financial.totalObligationDisplay,
      amountPaid: model.financial.amountPaid,
      amountPaidDisplay: model.financial.amountPaidDisplay,
      balanceDue: model.financial.balanceDue,
      balanceDueDisplay: model.financial.balanceDueDisplay,
      refundableAmount: model.financial.refundableAmount,
      refundableAmountDisplay: model.financial.refundableAmountDisplay,
      currency: model.financial.currency,
    }),
    dueDate: typeof model.dueDate === "undefined" ? undefined : new Date(model.dueDate.getTime()),
    dueDateDisplay: model.dueDateDisplay,
    deposit: freezeDeposit(model.deposit),
    payments: Object.freeze(model.payments.map(createInvoicePaymentPresentationModel)),
    adjustments: Object.freeze(model.adjustments.map(createInvoiceAdjustmentPresentationModel)),
    cancellation: model.cancellation
      ? createInvoiceCancellationPresentationModel(model.cancellation)
      : undefined,
    externalReferences: freezeExternalReferences(model.externalReferences),
    metadata: Object.freeze({
      createdAt: new Date(model.metadata.createdAt.getTime()),
      createdAtDisplay: model.metadata.createdAtDisplay,
      updatedAt: new Date(model.metadata.updatedAt.getTime()),
      updatedAtDisplay: model.metadata.updatedAtDisplay,
      version: model.metadata.version,
    }),
  });
}
