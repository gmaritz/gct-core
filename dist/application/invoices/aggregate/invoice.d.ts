import { InvoiceAdjustment, InvoiceCancellationSnapshot, InvoiceCustomerReference, InvoiceDepositRequirement, InvoiceExternalReference, InvoiceFinancialObligation, InvoiceIdentity, InvoiceMetadata, InvoicePaymentAllocation, InvoicePricingSnapshot, InvoiceQuoteReference, InvoiceReservationReference, InvoiceStatus } from "../models";
export { InvoiceStatus, };
export type { InvoiceAdjustment, InvoiceCancellationSnapshot, InvoiceCustomerReference, InvoiceDepositRequirement, InvoiceExternalReference, InvoiceFinancialObligation, InvoiceIdentity, InvoiceMetadata, InvoicePaymentAllocation, InvoicePricingSnapshot, InvoiceQuoteReference, InvoiceReservationReference, };
export interface InvoiceComposition {
    readonly identity: InvoiceIdentity;
    readonly reservationReference: InvoiceReservationReference;
    readonly customerReference: InvoiceCustomerReference;
    readonly quoteReference: InvoiceQuoteReference;
    readonly pricingSnapshot: InvoicePricingSnapshot;
    readonly status: InvoiceStatus;
    readonly financialObligation: InvoiceFinancialObligation;
    readonly depositRequirement?: InvoiceDepositRequirement;
    readonly paymentAllocations?: ReadonlyArray<InvoicePaymentAllocation>;
    readonly amountPaid?: number;
    readonly balanceDue?: number;
    readonly dueDate?: Date;
    readonly adjustments?: ReadonlyArray<InvoiceAdjustment>;
    readonly cancellationSnapshot?: InvoiceCancellationSnapshot;
    readonly refundableAmount?: number;
    readonly externalReferences?: ReadonlyArray<InvoiceExternalReference>;
    readonly metadata: InvoiceMetadata;
}
export declare class Invoice {
    readonly identity: InvoiceIdentity;
    readonly reservationReference: InvoiceReservationReference;
    readonly customerReference: InvoiceCustomerReference;
    readonly quoteReference: InvoiceQuoteReference;
    readonly status: InvoiceStatus;
    readonly financialObligation: InvoiceFinancialObligation;
    readonly depositRequirement?: InvoiceDepositRequirement;
    readonly amountPaid: number;
    readonly balanceDue: number;
    readonly refundableAmount: number;
    private readonly pricingSnapshotState;
    private readonly paymentAllocationsState;
    private readonly dueDateState?;
    private readonly adjustmentsState;
    private readonly cancellationSnapshotState?;
    private readonly externalReferencesState;
    private readonly metadataState;
    private constructor();
    get pricingSnapshot(): InvoicePricingSnapshot;
    get paymentAllocations(): ReadonlyArray<InvoicePaymentAllocation>;
    get dueDate(): Date | undefined;
    get adjustments(): ReadonlyArray<InvoiceAdjustment>;
    get cancellationSnapshot(): InvoiceCancellationSnapshot | undefined;
    get externalReferences(): ReadonlyArray<InvoiceExternalReference>;
    get metadata(): InvoiceMetadata;
    static create(composition: InvoiceComposition): Invoice;
    static restore(composition: InvoiceComposition): Invoice;
}
//# sourceMappingURL=invoice.d.ts.map