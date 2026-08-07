"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayReadinessValidator = void 0;
const models_1 = require("../models");
class GatewayReadinessValidator {
    validate(request) {
        const errors = [];
        if (!request.gatewayContext) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.GATEWAY_READINESS,
                code: models_1.PaymentValidationErrorCode.INCOMPLETE_GATEWAY_CONTEXT,
                message: "Gateway context is required.",
                severity: "CRITICAL",
            }));
        }
        if (!request.gatewayContext?.providerReference?.reference) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.GATEWAY_READINESS,
                code: models_1.PaymentValidationErrorCode.MISSING_PROVIDER_REFERENCE,
                message: "Provider reference is required for gateway readiness.",
                severity: "CRITICAL",
            }));
        }
        if (!request.gatewayContext?.correlationId || !request.gatewayContext.requestId) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.GATEWAY_READINESS,
                code: models_1.PaymentValidationErrorCode.MISSING_CORRELATION_IDENTIFIERS,
                message: "Correlation identifiers are required.",
                severity: "CRITICAL",
            }));
        }
        if (!request.gatewayContext?.paymentContextId || !request.reference?.paymentId) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.GATEWAY_READINESS,
                code: models_1.PaymentValidationErrorCode.MISSING_PAYMENT_CONTEXT,
                message: "Payment context is incomplete.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_1.createPaymentValidationResult)({
            stage: models_1.PaymentValidationStage.GATEWAY_READINESS,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "GatewayReadinessValidator",
            },
        });
    }
}
exports.GatewayReadinessValidator = GatewayReadinessValidator;
//# sourceMappingURL=gateway-readiness-validator.js.map