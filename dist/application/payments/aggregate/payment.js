"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function ensureInvariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function validateRequiredComposition(composition) {
    ensureInvariant(!isBlank(composition.reference?.paymentId), "Payment identity is required.");
    ensureInvariant(typeof composition.reservationSnapshot === "object" && composition.reservationSnapshot !== null, "Reservation snapshot is required.");
    ensureInvariant(typeof composition.pricingSnapshot === "object" && composition.pricingSnapshot !== null, "Pricing snapshot is required.");
    ensureInvariant(typeof composition.paymentMethod === "string", "Payment method is required.");
    ensureInvariant(!isBlank(composition.currency), "Payment currency is required.");
    ensureInvariant(typeof composition.status === "string", "Payment status is required.");
    ensureInvariant(typeof composition.metadata === "object" && composition.metadata !== null, "Payment metadata is required.");
}
class Payment {
    constructor(composition) {
        validateRequiredComposition(composition);
        const state = (0, models_1.createPaymentState)({
            reference: composition.reference,
            reservationSnapshot: composition.reservationSnapshot,
            quoteSnapshot: composition.quoteSnapshot,
            pricingSnapshot: composition.pricingSnapshot,
            paymentAmount: composition.paymentAmount,
            currency: composition.currency,
            paymentMethod: composition.paymentMethod,
            paymentInstrument: composition.paymentInstrument,
            status: composition.status,
            authorization: composition.authorization,
            capture: composition.capture,
            settlement: composition.settlement,
            refunds: composition.refunds ?? [],
        });
        this.reference = state.reference;
        this.transactionReference =
            typeof composition.transactionReference === "undefined"
                ? undefined
                : (0, models_1.createTransactionReference)(composition.transactionReference);
        this.reservationSnapshot = state.reservationSnapshot;
        this.quoteSnapshot = state.quoteSnapshot;
        this.pricingSnapshot = state.pricingSnapshot;
        this.paymentAmount = state.paymentAmount;
        this.currency = state.currency;
        this.paymentMethod = state.paymentMethod;
        this.paymentInstrument = state.paymentInstrument;
        this.status = state.status;
        this.authorization = state.authorization;
        this.capture = state.capture;
        this.settlement = state.settlement;
        this.refunds = state.refunds;
        this.timeline = (0, models_1.createPaymentTimeline)(composition.timeline ?? []);
        this.metadata = (0, models_1.createPaymentMetadata)(composition.metadata);
        Object.freeze(this);
    }
    static create(composition) {
        return new Payment(composition);
    }
    static restore(composition) {
        return new Payment(composition);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map