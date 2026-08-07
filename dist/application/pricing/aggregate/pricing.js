"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pricing = void 0;
const models_1 = require("../models");
function freezeIdentity(identity) {
    return Object.freeze({
        id: identity.id,
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
        this.summary = (0, models_1.createPricingSummary)(composition.summary);
        this.breakdown = (0, models_1.createPricingBreakdown)(composition.breakdown);
        this.taxes = (0, models_1.createTaxBreakdown)(composition.taxes);
        this.fees = Object.freeze(composition.fees.map(models_1.createFee));
        this.discounts = Object.freeze(composition.discounts.map(models_1.createDiscount));
        this.markups = Object.freeze(composition.markups.map(models_1.createMarkup));
        this.commissions = Object.freeze(composition.commissions.map(models_1.createCommission));
        this.totals = (0, models_1.createPricingTotal)(composition.totals);
        this.currency = composition.currency;
        this.metadata = (0, models_1.createPricingMetadata)(composition.metadata);
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