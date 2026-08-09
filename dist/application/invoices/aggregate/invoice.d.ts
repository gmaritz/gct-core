export interface InvoiceIdentity {
    readonly id: string;
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    ISSUED = "ISSUED",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    CANCELLED = "CANCELLED",
    VOID = "VOID"
}
export interface InvoiceFinancialObligation {
    readonly totalAmount: number;
    readonly currency: string;
}
export interface InvoiceReservationReference {
    readonly reservationId: string;
}
export interface InvoiceCustomerReference {
    readonly customerId?: string;
    readonly travellerId?: string;
}
export interface InvoiceQuoteReference {
    readonly quoteId: string;
    readonly quoteVersion: string;
}
export interface InvoicePricingSnapshot {
    readonly snapshotId: string;
    readonly pricingId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly currency: string;
    readonly totalAmount: number;
}
export interface InvoiceDepositRequirement {
    readonly type: "FIXED" | "PERCENTAGE";
    readonly value: number;
}
export interface InvoicePaymentAllocation {
    readonly paymentId: string;
    readonly allocatedAmount: number;
    readonly allocatedAt: Date;
    readonly externalReference?: string;
}
export interface InvoiceAdjustment {
    readonly id: string;
    readonly type: string;
    readonly amount: number;
    readonly reason: string;
    readonly appliedAt: Date;
}
export interface InvoiceCancellationSnapshot {
    readonly policyReference: string;
    readonly policyVersion?: string;
    readonly effectiveFrom?: Date;
    readonly effectiveTo?: Date;
    readonly cancellationDate: Date;
    readonly cancellationCharge: number;
    readonly refundableAmount: number;
}
export interface InvoiceExternalReference {
    readonly system: string;
    readonly reference: string;
}
export interface InvoiceMetadata {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: string;
}
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