"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = exports.InvoiceStatus = void 0;
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["ISSUED"] = "ISSUED";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
    InvoiceStatus["VOID"] = "VOID";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function isValidDate(value) {
    return value instanceof Date && Number.isFinite(value.getTime());
}
function cloneDate(value) {
    return new Date(value.getTime());
}
function ensureInvariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function freezeIdentity(identity) {
    return Object.freeze({
        id: identity.id,
    });
}
function freezeReservationReference(reference) {
    return Object.freeze({
        reservationId: reference.reservationId,
    });
}
function freezeCustomerReference(reference) {
    return Object.freeze({
        customerId: reference.customerId,
        travellerId: reference.travellerId,
    });
}
function freezeQuoteReference(reference) {
    return Object.freeze({
        quoteId: reference.quoteId,
        quoteVersion: reference.quoteVersion,
    });
}
function freezePricingSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        pricingId: snapshot.pricingId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        currency: snapshot.currency,
        totalAmount: snapshot.totalAmount,
    });
}
function freezeFinancialObligation(obligation) {
    return Object.freeze({
        totalAmount: obligation.totalAmount,
        currency: obligation.currency,
    });
}
function freezeDepositRequirement(deposit) {
    return Object.freeze({
        type: deposit.type,
        value: deposit.value,
    });
}
function freezePaymentAllocation(allocation) {
    return Object.freeze({
        paymentId: allocation.paymentId,
        allocatedAmount: allocation.allocatedAmount,
        allocatedAt: cloneDate(allocation.allocatedAt),
        externalReference: allocation.externalReference,
    });
}
function freezeAdjustment(adjustment) {
    return Object.freeze({
        id: adjustment.id,
        type: adjustment.type,
        amount: adjustment.amount,
        reason: adjustment.reason,
        appliedAt: cloneDate(adjustment.appliedAt),
    });
}
function freezeCancellationSnapshot(snapshot) {
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
function freezeExternalReference(reference) {
    return Object.freeze({
        system: reference.system,
        reference: reference.reference,
    });
}
function freezeMetadata(metadata) {
    return Object.freeze({
        createdAt: cloneDate(metadata.createdAt),
        updatedAt: cloneDate(metadata.updatedAt),
        version: metadata.version,
    });
}
function validateIdentity(identity) {
    ensureInvariant(typeof identity === "object" && identity !== null, "Invoice identity is required.");
    ensureInvariant(!isBlank(identity.id), "Invoice identity is required.");
}
function validateReservationReference(reference) {
    ensureInvariant(typeof reference === "object" && reference !== null, "Invoice reservation reference is required.");
    ensureInvariant(!isBlank(reference.reservationId), "Invoice reservation ID is required.");
}
function validateCustomerReference(reference) {
    ensureInvariant(typeof reference === "object" && reference !== null, "Invoice customer/traveller reference is required.");
    const hasCustomerId = typeof reference.customerId === "string" && reference.customerId.trim().length > 0;
    const hasTravellerId = typeof reference.travellerId === "string" && reference.travellerId.trim().length > 0;
    ensureInvariant(hasCustomerId || hasTravellerId, "At least one of customerId or travellerId is required for invoice customer reference.");
    if (typeof reference.customerId === "string") {
        ensureInvariant(reference.customerId.trim().length > 0, "Invoice customer ID cannot be blank.");
    }
    if (typeof reference.travellerId === "string") {
        ensureInvariant(reference.travellerId.trim().length > 0, "Invoice traveller ID cannot be blank.");
    }
}
function validateQuoteReference(reference) {
    ensureInvariant(typeof reference === "object" && reference !== null, "Invoice quote reference is required.");
    ensureInvariant(!isBlank(reference.quoteId), "Invoice quote ID is required.");
    ensureInvariant(!isBlank(reference.quoteVersion), "Invoice quote version is required.");
}
function validatePricingSnapshot(snapshot) {
    ensureInvariant(typeof snapshot === "object" && snapshot !== null, "Invoice pricing snapshot is required.");
    ensureInvariant(!isBlank(snapshot.snapshotId), "Invoice pricing snapshot ID is required.");
    ensureInvariant(!isBlank(snapshot.pricingId), "Invoice pricing ID is required.");
    ensureInvariant(!isBlank(snapshot.version), "Invoice pricing version is required.");
    ensureInvariant(!isBlank(snapshot.currency), "Invoice pricing currency is required.");
    ensureInvariant(isFiniteNumber(snapshot.totalAmount), "Invoice pricing total amount must be finite.");
    ensureInvariant(snapshot.totalAmount >= 0, "Invoice pricing total amount cannot be negative.");
    ensureInvariant(isValidDate(snapshot.capturedAt), "Invoice pricing capturedAt is invalid.");
}
function validateStatus(status) {
    ensureInvariant(typeof status === "string", "Invoice status is required.");
    ensureInvariant(Object.values(InvoiceStatus).includes(status), "Invoice status is invalid.");
}
function validateFinancialObligation(obligation) {
    ensureInvariant(typeof obligation === "object" && obligation !== null, "Invoice financial obligation is required.");
    ensureInvariant(isFiniteNumber(obligation.totalAmount), "Invoice total amount must be finite.");
    ensureInvariant(obligation.totalAmount >= 0, "Invoice total amount cannot be negative.");
    ensureInvariant(!isBlank(obligation.currency), "Invoice currency is required.");
}
function validateDepositRequirement(deposit) {
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
function validatePaymentAllocation(allocation) {
    ensureInvariant(typeof allocation === "object" && allocation !== null, "Invoice payment allocation is invalid.");
    ensureInvariant(!isBlank(allocation.paymentId), "Invoice payment allocation paymentId is required.");
    ensureInvariant(isFiniteNumber(allocation.allocatedAmount), "Invoice payment allocation amount must be finite.");
    ensureInvariant(allocation.allocatedAmount > 0, "Invoice payment allocation amount must be greater than zero.");
    ensureInvariant(isValidDate(allocation.allocatedAt), "Invoice payment allocation allocatedAt is invalid.");
}
function validateAdjustment(adjustment) {
    ensureInvariant(typeof adjustment === "object" && adjustment !== null, "Invoice adjustment is invalid.");
    ensureInvariant(!isBlank(adjustment.id), "Invoice adjustment ID is required.");
    ensureInvariant(!isBlank(adjustment.type), "Invoice adjustment type is required.");
    ensureInvariant(isFiniteNumber(adjustment.amount), "Invoice adjustment amount must be finite.");
    ensureInvariant(!isBlank(adjustment.reason), "Invoice adjustment reason is required.");
    ensureInvariant(isValidDate(adjustment.appliedAt), "Invoice adjustment appliedAt is invalid.");
}
function validateCancellationSnapshot(snapshot) {
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
function validateExternalReference(reference) {
    ensureInvariant(typeof reference === "object" && reference !== null, "Invoice external reference is invalid.");
    ensureInvariant(!isBlank(reference.system), "Invoice external reference system is required.");
    ensureInvariant(!isBlank(reference.reference), "Invoice external reference value is required.");
}
function validateMetadata(metadata) {
    ensureInvariant(typeof metadata === "object" && metadata !== null, "Invoice metadata is required.");
    ensureInvariant(isValidDate(metadata.createdAt), "Invoice metadata createdAt is invalid.");
    ensureInvariant(isValidDate(metadata.updatedAt), "Invoice metadata updatedAt is invalid.");
    ensureInvariant(!isBlank(metadata.version), "Invoice metadata version is required.");
}
function validateFinancialState(amountPaid, balanceDue, refundableAmount) {
    ensureInvariant(isFiniteNumber(amountPaid), "Invoice amountPaid must be finite.");
    ensureInvariant(amountPaid >= 0, "Invoice amountPaid cannot be negative.");
    ensureInvariant(isFiniteNumber(balanceDue), "Invoice balanceDue must be finite.");
    ensureInvariant(balanceDue >= 0, "Invoice balanceDue cannot be negative.");
    ensureInvariant(isFiniteNumber(refundableAmount), "Invoice refundableAmount must be finite.");
    ensureInvariant(refundableAmount >= 0, "Invoice refundableAmount cannot be negative.");
}
function validateDueDate(dueDate) {
    if (typeof dueDate === "undefined") {
        return;
    }
    ensureInvariant(isValidDate(dueDate), "Invoice dueDate is invalid.");
}
function validateRequiredComposition(composition) {
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
class Invoice {
    constructor(composition) {
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
    get pricingSnapshot() {
        return freezePricingSnapshot(this.pricingSnapshotState);
    }
    get paymentAllocations() {
        return Object.freeze(this.paymentAllocationsState.map(freezePaymentAllocation));
    }
    get dueDate() {
        return typeof this.dueDateState === "undefined" ? undefined : cloneDate(this.dueDateState);
    }
    get adjustments() {
        return Object.freeze(this.adjustmentsState.map(freezeAdjustment));
    }
    get cancellationSnapshot() {
        return typeof this.cancellationSnapshotState === "undefined"
            ? undefined
            : freezeCancellationSnapshot(this.cancellationSnapshotState);
    }
    get externalReferences() {
        return Object.freeze(this.externalReferencesState.map(freezeExternalReference));
    }
    get metadata() {
        return freezeMetadata(this.metadataState);
    }
    static create(composition) {
        return new Invoice(composition);
    }
    static restore(composition) {
        return new Invoice(composition);
    }
}
exports.Invoice = Invoice;
//# sourceMappingURL=invoice.js.map