"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pricing = void 0;
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeIdentity(identity) {
    return Object.freeze({
        id: identity.id,
    });
}
function freezeSummary(summary) {
    return Object.freeze({
        productId: summary.productId,
        productType: summary.productType,
        description: summary.description,
    });
}
function freezeBreakdownLineItem(item) {
    return Object.freeze({
        code: item.code,
        label: item.label,
        amount: item.amount,
        quantity: item.quantity,
    });
}
function freezeBreakdown(breakdown) {
    return Object.freeze({
        lineItems: Object.freeze(breakdown.lineItems.map(freezeBreakdownLineItem)),
    });
}
function freezeTaxEntry(entry) {
    return Object.freeze({
        code: entry.code,
        amount: entry.amount,
    });
}
function freezeFeeEntry(entry) {
    return Object.freeze({
        code: entry.code,
        amount: entry.amount,
    });
}
function freezeDiscountEntry(entry) {
    return Object.freeze({
        code: entry.code,
        amount: entry.amount,
    });
}
function freezeMarkupEntry(entry) {
    return Object.freeze({
        code: entry.code,
        amount: entry.amount,
    });
}
function freezeCommissionEntry(entry) {
    return Object.freeze({
        code: entry.code,
        amount: entry.amount,
    });
}
function freezeTaxes(taxes) {
    return Object.freeze({
        entries: Object.freeze(taxes.entries.map(freezeTaxEntry)),
    });
}
function freezeFees(fees) {
    return Object.freeze({
        entries: Object.freeze(fees.entries.map(freezeFeeEntry)),
    });
}
function freezeDiscounts(discounts) {
    return Object.freeze({
        entries: Object.freeze(discounts.entries.map(freezeDiscountEntry)),
    });
}
function freezeMarkups(markups) {
    return Object.freeze({
        entries: Object.freeze(markups.entries.map(freezeMarkupEntry)),
    });
}
function freezeCommissions(commissions) {
    return Object.freeze({
        entries: Object.freeze(commissions.entries.map(freezeCommissionEntry)),
    });
}
function freezeTotals(totals) {
    return Object.freeze({
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        feeTotal: totals.feeTotal,
        discountTotal: totals.discountTotal,
        markupTotal: totals.markupTotal,
        commissionTotal: totals.commissionTotal,
        grandTotal: totals.grandTotal,
    });
}
function freezeMetadata(metadata) {
    return Object.freeze({
        createdAt: cloneDate(metadata.createdAt),
        updatedAt: cloneDate(metadata.updatedAt),
        version: metadata.version,
        source: metadata.source,
    });
}
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function ensureInvariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function validateRequiredComposition(composition) {
    ensureInvariant(!isBlank(composition.identity?.id), "Pricing identity is required.");
    ensureInvariant(!isBlank(composition.currency), "Pricing currency is required.");
    ensureInvariant(typeof composition.totals === "object" && composition.totals !== null, "Pricing totals are required.");
    ensureInvariant(typeof composition.breakdown === "object" && composition.breakdown !== null, "Pricing breakdown is required.");
    ensureInvariant(Array.isArray(composition.breakdown.lineItems) && composition.breakdown.lineItems.length > 0, "Pricing breakdown is required.");
    ensureInvariant(typeof composition.metadata === "object" && composition.metadata !== null, "Pricing metadata is required.");
}
class Pricing {
    constructor(composition) {
        validateRequiredComposition(composition);
        this.identity = freezeIdentity(composition.identity);
        this.summary = freezeSummary(composition.summary);
        this.breakdown = freezeBreakdown(composition.breakdown);
        this.taxes = freezeTaxes(composition.taxes);
        this.fees = freezeFees(composition.fees);
        this.discounts = freezeDiscounts(composition.discounts);
        this.markups = freezeMarkups(composition.markups);
        this.commissions = freezeCommissions(composition.commissions);
        this.totals = freezeTotals(composition.totals);
        this.currency = composition.currency;
        this.metadata = freezeMetadata(composition.metadata);
        Object.freeze(this);
    }
    static create(composition) {
        return new Pricing(composition);
    }
    static restore(composition) {
        return new Pricing(composition);
    }
}
exports.Pricing = Pricing;
//# sourceMappingURL=pricing.js.map