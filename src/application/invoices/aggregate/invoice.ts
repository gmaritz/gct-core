export interface InvoiceIdentity {
  readonly id: string;
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  ISSUED = "ISSUED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  VOID = "VOID",
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

function freezeIdentity(identity: InvoiceIdentity): InvoiceIdentity {
  return Object.freeze({
    id: identity.id,
  });
}

function freezeReservationReference(reference: InvoiceReservationReference): InvoiceReservationReference {
  return Object.freeze({
    reservationId: reference.reservationId,
  });
}

function freezeCustomerReference(reference: InvoiceCustomerReference): InvoiceCustomerReference {
  return Object.freeze({
    customerId: reference.customerId,
    travellerId: reference.travellerId,
  });
}

function freezeQuoteReference(reference: InvoiceQuoteReference): InvoiceQuoteReference {
  return Object.freeze({
    quoteId: reference.quoteId,
    quoteVersion: reference.quoteVersion,
  });
}

function freezePricingSnapshot(snapshot: InvoicePricingSnapshot): InvoicePricingSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    pricingId: snapshot.pricingId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    currency: snapshot.currency,
    totalAmount: snapshot.totalAmount,
  });
}

function freezeFinancialObligation(obligation: InvoiceFinancialObligation): InvoiceFinancialObligation {
  return Object.freeze({
    totalAmount: obligation.totalAmount,
    currency: obligation.currency,
  });
}

function freezeDepositRequirement(deposit: InvoiceDepositRequirement): InvoiceDepositRequirement {
  return Object.freeze({
    type: deposit.type,
    value: deposit.value,
  });
}

function freezePaymentAllocation(allocation: InvoicePaymentAllocation): InvoicePaymentAllocation {
  return Object.freeze({
    paymentId: allocation.paymentId,
    allocatedAmount: allocation.allocatedAmount,
    allocatedAt: cloneDate(allocation.allocatedAt),
    externalReference: allocation.externalReference,
  });
}

function freezeAdjustment(adjustment: InvoiceAdjustment): InvoiceAdjustment {
  return Object.freeze({
    id: adjustment.id,
    type: adjustment.type,
    amount: adjustment.amount,
    reason: adjustment.reason,
    appliedAt: cloneDate(adjustment.appliedAt),
  });
}

function freezeCancellationSnapshot(snapshot: InvoiceCancellationSnapshot): InvoiceCancellationSnapshot {
  return Object.freeze({
    policyReference: snapshot.policyReference,
    policyVersion: snapshot.policyVersion,
    effectiveFrom: typeof snapshot.effectiveFrom === "undefined" ? undefined : cloneDate(snapshot.effectiveFrom),
    effectiveTo: typeof snapshot.effectiveTo === "undefined" ? undefined : cloneDate(snapshot.effectiveTo),
    cancellationDate: cloneDate(snapshot.cancellationDate),
    cancellationCharge: snapshot.cancellationCharge,
    refundableAmount: snapshot.refundableAmount,
  });
}

function freezeExternalReference(reference: InvoiceExternalReference): InvoiceExternalReference {
  return Object.freeze({
    system: reference.system,
    reference: reference.reference,
  });
}

function freezeMetadata(metadata: InvoiceMetadata): InvoiceMetadata {
  return Object.freeze({
    createdAt: cloneDate(metadata.createdAt),
    updatedAt: cloneDate(metadata.updatedAt),
    version: metadata.version,
  });
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

    this.identity = freezeIdentity(composition.identity);
    this.reservationReference = freezeReservationReference(composition.reservationReference);
    this.customerReference = freezeCustomerReference(composition.customerReference);
    this.quoteReference = freezeQuoteReference(composition.quoteReference);
    this.status = composition.status;
    this.financialObligation = freezeFinancialObligation(composition.financialObligation);
    this.depositRequirement =
      typeof composition.depositRequirement === "undefined"
        ? undefined
        : freezeDepositRequirement(composition.depositRequirement);
    this.amountPaid = composition.amountPaid ?? 0;
    this.balanceDue = composition.balanceDue ?? composition.financialObligation.totalAmount;
    this.refundableAmount = composition.refundableAmount ?? 0;

    this.pricingSnapshotState = freezePricingSnapshot(composition.pricingSnapshot);
    this.paymentAllocationsState = Object.freeze((composition.paymentAllocations ?? []).map(freezePaymentAllocation));
    this.dueDateState = typeof composition.dueDate === "undefined" ? undefined : cloneDate(composition.dueDate);
    this.adjustmentsState = Object.freeze((composition.adjustments ?? []).map(freezeAdjustment));
    this.cancellationSnapshotState =
      typeof composition.cancellationSnapshot === "undefined"
        ? undefined
        : freezeCancellationSnapshot(composition.cancellationSnapshot);
    this.externalReferencesState = Object.freeze((composition.externalReferences ?? []).map(freezeExternalReference));
    this.metadataState = freezeMetadata(composition.metadata);

    Object.freeze(this);
  }

  public get pricingSnapshot(): InvoicePricingSnapshot {
    return freezePricingSnapshot(this.pricingSnapshotState);
  }

  public get paymentAllocations(): ReadonlyArray<InvoicePaymentAllocation> {
    return Object.freeze(this.paymentAllocationsState.map(freezePaymentAllocation));
  }

  public get dueDate(): Date | undefined {
    return typeof this.dueDateState === "undefined" ? undefined : cloneDate(this.dueDateState);
  }

  public get adjustments(): ReadonlyArray<InvoiceAdjustment> {
    return Object.freeze(this.adjustmentsState.map(freezeAdjustment));
  }

  public get cancellationSnapshot(): InvoiceCancellationSnapshot | undefined {
    return typeof this.cancellationSnapshotState === "undefined"
      ? undefined
      : freezeCancellationSnapshot(this.cancellationSnapshotState);
  }

  public get externalReferences(): ReadonlyArray<InvoiceExternalReference> {
    return Object.freeze(this.externalReferencesState.map(freezeExternalReference));
  }

  public get metadata(): InvoiceMetadata {
    return freezeMetadata(this.metadataState);
  }

  public static create(composition: InvoiceComposition): Invoice {
    return new Invoice(composition);
  }

  public static restore(composition: InvoiceComposition): Invoice {
    return new Invoice(composition);
  }
}
