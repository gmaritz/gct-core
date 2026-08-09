import { InvoiceStatus } from "../../models";
import { InvoiceAdjustmentPresentationModel } from "./invoice-adjustment-presentation-model";
import { InvoiceCancellationPresentationModel } from "./invoice-cancellation-presentation-model";
import { InvoicePaymentPresentationModel } from "./invoice-payment-presentation-model";
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
export declare function createInvoicePresentationModel(model: InvoicePresentationModel): InvoicePresentationModel;
//# sourceMappingURL=invoice-presentation-model.d.ts.map