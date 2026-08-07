"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementReadinessValidator = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
const SUPPORTED_METHODS = new Set([
    models_1.PaymentMethod.CARD,
    models_1.PaymentMethod.EFT,
    models_1.PaymentMethod.INSTANT_PAYMENT,
    models_1.PaymentMethod.WALLET,
    models_1.PaymentMethod.BANK_TRANSFER,
]);
const SUPPORTED_CURRENCIES = new Set(["ZAR", "USD", "EUR", "GBP"]);
const SUPPORTED_STATES = new Set([
    models_1.PaymentStatus.CREATED,
    models_1.PaymentStatus.AUTHORIZATION_REQUESTED,
    models_1.PaymentStatus.AUTHORIZED,
]);
class SettlementReadinessValidator {
    validate(request) {
        const errors = [];
        if (!request.paymentMethod || !SUPPORTED_METHODS.has(request.paymentMethod)) {
            errors.push((0, models_2.createPaymentValidationError)({
                stage: models_2.PaymentValidationStage.SETTLEMENT_READINESS,
                code: models_2.PaymentValidationErrorCode.UNSUPPORTED_PAYMENT_METHOD,
                message: "Payment method is not supported for settlement.",
                severity: "CRITICAL",
            }));
        }
        if (!request.currency || !SUPPORTED_CURRENCIES.has(request.currency)) {
            errors.push((0, models_2.createPaymentValidationError)({
                stage: models_2.PaymentValidationStage.SETTLEMENT_READINESS,
                code: models_2.PaymentValidationErrorCode.UNSUPPORTED_CURRENCY,
                message: "Currency is not supported for settlement.",
                severity: "CRITICAL",
            }));
        }
        if (request.pricingSnapshot &&
            typeof request.paymentAmount === "number" &&
            request.paymentAmount !== request.pricingSnapshot.total) {
            errors.push((0, models_2.createPaymentValidationError)({
                stage: models_2.PaymentValidationStage.SETTLEMENT_READINESS,
                code: models_2.PaymentValidationErrorCode.AMOUNT_INCONSISTENT,
                message: "Payment amount must equal pricing total.",
                severity: "CRITICAL",
            }));
        }
        if (!request.metadata?.version || !request.metadata.source) {
            errors.push((0, models_2.createPaymentValidationError)({
                stage: models_2.PaymentValidationStage.SETTLEMENT_READINESS,
                code: models_2.PaymentValidationErrorCode.INVALID_SETTLEMENT_METADATA,
                message: "Settlement metadata is incomplete.",
                severity: "CRITICAL",
            }));
        }
        if (!request.status || !SUPPORTED_STATES.has(request.status)) {
            errors.push((0, models_2.createPaymentValidationError)({
                stage: models_2.PaymentValidationStage.SETTLEMENT_READINESS,
                code: models_2.PaymentValidationErrorCode.INVALID_PAYMENT_LIFECYCLE_STATE,
                message: "Payment lifecycle state is not settlement-ready.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_2.createPaymentValidationResult)({
            stage: models_2.PaymentValidationStage.SETTLEMENT_READINESS,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "SettlementReadinessValidator",
            },
        });
    }
}
exports.SettlementReadinessValidator = SettlementReadinessValidator;
//# sourceMappingURL=settlement-readiness-validator.js.map