import {
  createInvoiceAdjustment,
  createInvoiceCancellationSnapshot,
  createInvoiceCustomerReference,
  createInvoiceDepositRequirement,
  createInvoiceExternalReference,
  createInvoiceFinancialObligation,
  createInvoiceIdentity,
  createInvoiceMetadata,
  createInvoicePaymentAllocation,
  createInvoicePricingSnapshot,
  createInvoiceQuoteReference,
  createInvoiceReservationReference,
  InvoiceAdjustment,
  InvoiceCancellationSnapshot,
  InvoiceCustomerReference,
  InvoiceDepositRequirement,
  InvoiceExternalReference,
  InvoiceFinancialObligation,
  InvoiceIdentity,
  InvoiceMetadata,
  InvoicePaymentAllocation,
  InvoicePricingSnapshot,
  InvoiceQuoteReference,
  InvoiceReservationReference,
  InvoiceStatus,
} from "../models";

export {
  InvoiceStatus,
};

export type {
  InvoiceAdjustment,
  InvoiceCancellationSnapshot,
  InvoiceCustomerReference,
  InvoiceDepositRequirement,
  InvoiceExternalReference,
  InvoiceFinancialObligation,
  InvoiceIdentity,
  InvoiceMetadata,
  InvoicePaymentAllocation,
  InvoicePricingSnapshot,
  InvoiceQuoteReference,
  InvoiceReservationReference,
};

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

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function ensureInvariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateIdentity(identity: InvoiceIdentity): void {
  ensureInvariant(typeof identity === "object" && identity !== null, "Invoice identity is required.");
  ensureInvariant(!isBlank(identity.id), "Invoice identity is required.");
}

function validateReservationReference(reference: InvoiceReservationReference): void {
  ensureInvariant(typeof reference === "object" && reference !== null, "Invoice reservation reference is required.");
  ensureInvariant(!isBlank(reference.reservationId), "Invoice reservation ID is required.");
}

function validateCustomerReference(reference: InvoiceCustomerReference): void {
  ensureInvariant(typeof reference === "object" && reference !== null, "Invoice customer/traveller reference is required.");

  const hasCustomerId = typeof reference.customerId === "string" && reference.customerId.trim().length > 0;
  const hasTravellerId = typeof reference.travellerId === "string" && reference.travellerId.trim().length > 0;

  ensureInvariant(
    hasCustomerId || hasTravellerId,
    "At least one of customerId or travellerId is required for invoice customer reference.",
  );

  if (typeof reference.customerId === "string") {
    ensureInvariant(reference.customerId.trim().length > 0, "Invoice customer ID cannot be blank.");
  }

  if (typeof reference.travellerId === "string") {
    ensureInvariant(reference.travellerId.trim().length > 0, "Invoice traveller ID cannot be blank.");
  }
}

function validateQuoteReference(reference: InvoiceQuoteReference): void {
  ensureInvariant(typeof reference === "object" && reference !== null, "Invoice quote reference is required.");
  ensureInvariant(!isBlank(reference.quoteId), "Invoice quote ID is required.");
  ensureInvariant(!isBlank(reference.quoteVersion), "Invoice quote version is required.");
}

function validatePricingSnapshot(snapshot: InvoicePricingSnapshot): void {
  ensureInvariant(typeof snapshot === "object" && snapshot !== null, "Invoice pricing snapshot is required.");
  ensureInvariant(!isBlank(snapshot.snapshotId), "Invoice pricing snapshot ID is required.");
  ensureInvariant(!isBlank(snapshot.pricingId), "Invoice pricing ID is required.");
  ensureInvariant(!isBlank(snapshot.version), "Invoice pricing version is required.");
  ensureInvariant(!isBlank(snapshot.currency), "Invoice pricing currency is required.");
  ensureInvariant(isFiniteNumber(snapshot.totalAmount), "Invoice pricing total amount must be finite.");
  ensureInvariant(snapshot.totalAmount >= 0, "Invoice pricing total amount cannot be negative.");
  ensureInvariant(isValidDate(snapshot.capturedAt), "Invoice pricing capturedAt is invalid.");
}

function validateStatus(status: InvoiceStatus): void {
  ensureInvariant(typeof status === "string", "Invoice status is required.");
  ensureInvariant(Object.values(InvoiceStatus).includes(status), "Invoice status is invalid.");
}

function validateFinancialObligation(obligation: InvoiceFinancialObligation): void {
  ensureInvariant(typeof obligation === "object" && obligation !== null, "Invoice financial obligation is required.");
  ensureInvariant(isFiniteNumber(obligation.totalAmount), "Invoice total amount must be finite.");
  ensureInvariant(obligation.totalAmount >= 0, "Invoice total amount cannot be negative.");
  ensureInvariant(!isBlank(obligation.currency), "Invoice currency is required.");
}

function validateDepositRequirement(deposit: InvoiceDepositRequirement | undefined): void {
  if (typeof deposit === "undefined") {
    return;
  }

  ensureInvariant(deposit.type === "FIXED" || deposit.type === "PERCENTAGE", "Invoice deposit type is invalid.");
  ensureInvariant(isFiniteNumber(deposit.value), "Invoice deposit value must be finite.");
  ensureInvariant(deposit.value >= 0, "Invoice deposit value cannot be negative.");

  if (deposit.type === "PERCENTAGE") {
    ensureInvariant(deposit.value <= 100, "Invoice deposit percentage cannot exceed 100.");
  }
}

function validatePaymentAllocation(allocation: InvoicePaymentAllocation): void {
  ensureInvariant(typeof allocation === "object" && allocation !== null, "Invoice payment allocation is invalid.");
  ensureInvariant(!isBlank(allocation.paymentId), "Invoice payment allocation paymentId is required.");
  ensureInvariant(isFiniteNumber(allocation.allocatedAmount), "Invoice payment allocation amount must be finite.");
  ensureInvariant(allocation.allocatedAmount > 0, "Invoice payment allocation amount must be greater than zero.");
  ensureInvariant(isValidDate(allocation.allocatedAt), "Invoice payment allocation allocatedAt is invalid.");
}

function validateAdjustment(adjustment: InvoiceAdjustment): void {
  ensureInvariant(typeof adjustment === "object" && adjustment !== null, "Invoice adjustment is invalid.");
  ensureInvariant(!isBlank(adjustment.id), "Invoice adjustment ID is required.");
  ensureInvariant(!isBlank(adjustment.type), "Invoice adjustment type is required.");
  ensureInvariant(isFiniteNumber(adjustment.amount), "Invoice adjustment amount must be finite.");
  ensureInvariant(!isBlank(adjustment.reason), "Invoice adjustment reason is required.");
  ensureInvariant(isValidDate(adjustment.appliedAt), "Invoice adjustment appliedAt is invalid.");
}

function validateCancellationSnapshot(snapshot: InvoiceCancellationSnapshot | undefined): void {
  if (typeof snapshot === "undefined") {
    return;
  }

  ensureInvariant(!isBlank(snapshot.policyReference), "Invoice cancellation policy reference is required.");

  if (typeof snapshot.policyVersion === "string") {
    ensureInvariant(snapshot.policyVersion.trim().length > 0, "Invoice cancellation policy version cannot be blank.");
  }

  if (typeof snapshot.effectiveFrom !== "undefined") {
    ensureInvariant(isValidDate(snapshot.effectiveFrom), "Invoice cancellation effectiveFrom is invalid.");
  }

  if (typeof snapshot.effectiveTo !== "undefined") {
    ensureInvariant(isValidDate(snapshot.effectiveTo), "Invoice cancellation effectiveTo is invalid.");
  }

  ensureInvariant(isValidDate(snapshot.cancellationDate), "Invoice cancellation date is invalid.");
  ensureInvariant(isFiniteNumber(snapshot.cancellationCharge), "Invoice cancellation charge must be finite.");
  ensureInvariant(snapshot.cancellationCharge >= 0, "Invoice cancellation charge cannot be negative.");
  ensureInvariant(isFiniteNumber(snapshot.refundableAmount), "Invoice cancellation refundable amount must be finite.");
  ensureInvariant(snapshot.refundableAmount >= 0, "Invoice cancellation refundable amount cannot be negative.");
}

function validateExternalReference(reference: InvoiceExternalReference): void {
  ensureInvariant(typeof reference === "object" && reference !== null, "Invoice external reference is invalid.");
  ensureInvariant(!isBlank(reference.system), "Invoice external reference system is required.");
  ensureInvariant(!isBlank(reference.reference), "Invoice external reference value is required.");
}

function validateMetadata(metadata: InvoiceMetadata): void {
  ensureInvariant(typeof metadata === "object" && metadata !== null, "Invoice metadata is required.");
  ensureInvariant(isValidDate(metadata.createdAt), "Invoice metadata createdAt is invalid.");
  ensureInvariant(isValidDate(metadata.updatedAt), "Invoice metadata updatedAt is invalid.");
  ensureInvariant(!isBlank(metadata.version), "Invoice metadata version is required.");
}

function validateFinancialState(amountPaid: number, balanceDue: number, refundableAmount: number): void {
  ensureInvariant(isFiniteNumber(amountPaid), "Invoice amountPaid must be finite.");
  ensureInvariant(amountPaid >= 0, "Invoice amountPaid cannot be negative.");
  ensureInvariant(isFiniteNumber(balanceDue), "Invoice balanceDue must be finite.");
  ensureInvariant(balanceDue >= 0, "Invoice balanceDue cannot be negative.");
  ensureInvariant(isFiniteNumber(refundableAmount), "Invoice refundableAmount must be finite.");
  ensureInvariant(refundableAmount >= 0, "Invoice refundableAmount cannot be negative.");
}

function validateDueDate(dueDate: Date | undefined): void {
  if (typeof dueDate === "undefined") {
    return;
  }

  ensureInvariant(isValidDate(dueDate), "Invoice dueDate is invalid.");
}

function validateRequiredComposition(composition: InvoiceComposition): void {
  validateIdentity(composition.identity);
  validateReservationReference(composition.reservationReference);
  validateCustomerReference(composition.customerReference);
  validateQuoteReference(composition.quoteReference);
  validatePricingSnapshot(composition.pricingSnapshot);
  validateStatus(composition.status);
  validateFinancialObligation(composition.financialObligation);
  validateDepositRequirement(composition.depositRequirement);

  for (const allocation of composition.paymentAllocations ?? []) {
    validatePaymentAllocation(allocation);
  }

  for (const adjustment of composition.adjustments ?? []) {
    validateAdjustment(adjustment);
  }

  validateCancellationSnapshot(composition.cancellationSnapshot);

  for (const externalReference of composition.externalReferences ?? []) {
    validateExternalReference(externalReference);
  }

  const amountPaid = composition.amountPaid ?? 0;
  const balanceDue = composition.balanceDue ?? composition.financialObligation.totalAmount;
  const refundableAmount = composition.refundableAmount ?? 0;

  validateFinancialState(amountPaid, balanceDue, refundableAmount);
  validateDueDate(composition.dueDate);
  validateMetadata(composition.metadata);
}

export class Invoice {
  public readonly identity: InvoiceIdentity;
  public readonly reservationReference: InvoiceReservationReference;
  public readonly customerReference: InvoiceCustomerReference;
  public readonly quoteReference: InvoiceQuoteReference;
  public readonly status: InvoiceStatus;
  public readonly financialObligation: InvoiceFinancialObligation;
  public readonly depositRequirement?: InvoiceDepositRequirement;
  public readonly amountPaid: number;
  public readonly balanceDue: number;
  public readonly refundableAmount: number;

  private readonly pricingSnapshotState: InvoicePricingSnapshot;
  private readonly paymentAllocationsState: ReadonlyArray<InvoicePaymentAllocation>;
  private readonly dueDateState?: Date;
  private readonly adjustmentsState: ReadonlyArray<InvoiceAdjustment>;
  private readonly cancellationSnapshotState?: InvoiceCancellationSnapshot;
  private readonly externalReferencesState: ReadonlyArray<InvoiceExternalReference>;
  private readonly metadataState: InvoiceMetadata;

  private constructor(composition: InvoiceComposition) {
    validateRequiredComposition(composition);

    this.identity = createInvoiceIdentity(composition.identity);
    this.reservationReference = createInvoiceReservationReference(composition.reservationReference);
    this.customerReference = createInvoiceCustomerReference(composition.customerReference);
    this.quoteReference = createInvoiceQuoteReference(composition.quoteReference);
    this.status = composition.status;
    this.financialObligation = createInvoiceFinancialObligation(composition.financialObligation);
    this.depositRequirement =
      typeof composition.depositRequirement === "undefined"
        ? undefined
        : createInvoiceDepositRequirement(composition.depositRequirement);
    this.amountPaid = composition.amountPaid ?? 0;
    this.balanceDue = composition.balanceDue ?? composition.financialObligation.totalAmount;
    this.refundableAmount = composition.refundableAmount ?? 0;

    this.pricingSnapshotState = createInvoicePricingSnapshot(composition.pricingSnapshot);
    this.paymentAllocationsState = Object.freeze((composition.paymentAllocations ?? []).map(createInvoicePaymentAllocation));
    this.dueDateState = typeof composition.dueDate === "undefined" ? undefined : cloneDate(composition.dueDate);
    this.adjustmentsState = Object.freeze((composition.adjustments ?? []).map(createInvoiceAdjustment));
    this.cancellationSnapshotState =
      typeof composition.cancellationSnapshot === "undefined"
        ? undefined
        : createInvoiceCancellationSnapshot(composition.cancellationSnapshot);
    this.externalReferencesState = Object.freeze((composition.externalReferences ?? []).map(createInvoiceExternalReference));
    this.metadataState = createInvoiceMetadata(composition.metadata);

    Object.freeze(this);
  }

  public get pricingSnapshot(): InvoicePricingSnapshot {
    return createInvoicePricingSnapshot(this.pricingSnapshotState);
  }

  public get paymentAllocations(): ReadonlyArray<InvoicePaymentAllocation> {
    return Object.freeze(this.paymentAllocationsState.map(createInvoicePaymentAllocation));
  }

  public get dueDate(): Date | undefined {
    return typeof this.dueDateState === "undefined" ? undefined : cloneDate(this.dueDateState);
  }

  public get adjustments(): ReadonlyArray<InvoiceAdjustment> {
    return Object.freeze(this.adjustmentsState.map(createInvoiceAdjustment));
  }

  public get cancellationSnapshot(): InvoiceCancellationSnapshot | undefined {
    return typeof this.cancellationSnapshotState === "undefined"
      ? undefined
      : createInvoiceCancellationSnapshot(this.cancellationSnapshotState);
  }

  public get externalReferences(): ReadonlyArray<InvoiceExternalReference> {
    return Object.freeze(this.externalReferencesState.map(createInvoiceExternalReference));
  }

  public get metadata(): InvoiceMetadata {
    return createInvoiceMetadata(this.metadataState);
  }

  public static create(composition: InvoiceComposition): Invoice {
    return new Invoice(composition);
  }

  public static restore(composition: InvoiceComposition): Invoice {
    return new Invoice(composition);
  }
}
