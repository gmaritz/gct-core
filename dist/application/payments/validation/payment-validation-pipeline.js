"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidationPipeline = void 0;
const models_1 = require("./models");
class PaymentValidationPipeline {
    constructor(requestValidator, reservationValidator, pricingValidator, settlementReadinessValidator, gatewayReadinessValidator) {
        this.requestValidator = requestValidator;
        this.reservationValidator = reservationValidator;
        this.pricingValidator = pricingValidator;
        this.settlementReadinessValidator = settlementReadinessValidator;
        this.gatewayReadinessValidator = gatewayReadinessValidator;
    }
    execute(request) {
        const stageResults = [];
        const requestResult = this.requestValidator.validate(request);
        stageResults.push(requestResult);
        if (this.hasCriticalErrors(requestResult.errors)) {
            return this.aggregateResult(models_1.PaymentValidationStage.REQUEST, stageResults);
        }
        const reservationResult = this.reservationValidator.validate(request);
        stageResults.push(reservationResult);
        if (this.hasCriticalErrors(reservationResult.errors)) {
            return this.aggregateResult(models_1.PaymentValidationStage.RESERVATION, stageResults);
        }
        const pricingResult = this.pricingValidator.validate(request);
        stageResults.push(pricingResult);
        if (this.hasCriticalErrors(pricingResult.errors)) {
            return this.aggregateResult(models_1.PaymentValidationStage.PRICING, stageResults);
        }
        const settlementReadinessResult = this.settlementReadinessValidator.validate(request);
        stageResults.push(settlementReadinessResult);
        if (this.hasCriticalErrors(settlementReadinessResult.errors)) {
            return this.aggregateResult(models_1.PaymentValidationStage.SETTLEMENT_READINESS, stageResults);
        }
        const gatewayReadinessResult = this.gatewayReadinessValidator.validate(request);
        stageResults.push(gatewayReadinessResult);
        return this.aggregateResult(models_1.PaymentValidationStage.GATEWAY_READINESS, stageResults);
    }
    hasCriticalErrors(errors) {
        return errors.some((error) => error.severity === "CRITICAL");
    }
    aggregateResult(stage, stageResults) {
        return (0, models_1.createPaymentValidationResult)({
            stage,
            errors: stageResults.flatMap((result) => result.errors),
            warnings: stageResults.flatMap((result) => result.warnings),
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "PaymentValidationPipeline",
            },
        });
    }
}
exports.PaymentValidationPipeline = PaymentValidationPipeline;
//# sourceMappingURL=payment-validation-pipeline.js.map