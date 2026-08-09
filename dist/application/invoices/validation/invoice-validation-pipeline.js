"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceValidationPipeline = void 0;
const models_1 = require("./models");
class InvoiceValidationPipeline {
    constructor(requestValidator, reservationValidator, commercialValidator, financialIntegrityValidator, lifecycleReadinessValidator) {
        this.requestValidator = requestValidator;
        this.reservationValidator = reservationValidator;
        this.commercialValidator = commercialValidator;
        this.financialIntegrityValidator = financialIntegrityValidator;
        this.lifecycleReadinessValidator = lifecycleReadinessValidator;
    }
    execute(request) {
        const stageResults = [];
        const requestResult = this.requestValidator.validate(request);
        stageResults.push(requestResult);
        if (this.hasCriticalErrors(requestResult.errors)) {
            return this.aggregateResult(models_1.InvoiceValidationStage.REQUEST, stageResults);
        }
        const reservationResult = this.reservationValidator.validate(request);
        stageResults.push(reservationResult);
        if (this.hasCriticalErrors(reservationResult.errors)) {
            return this.aggregateResult(models_1.InvoiceValidationStage.RESERVATION, stageResults);
        }
        const commercialResult = this.commercialValidator.validate(request);
        stageResults.push(commercialResult);
        if (this.hasCriticalErrors(commercialResult.errors)) {
            return this.aggregateResult(models_1.InvoiceValidationStage.COMMERCIAL, stageResults);
        }
        const financialResult = this.financialIntegrityValidator.validate(request);
        stageResults.push(financialResult);
        if (this.hasCriticalErrors(financialResult.errors)) {
            return this.aggregateResult(models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY, stageResults);
        }
        const lifecycleResult = this.lifecycleReadinessValidator.validate(request);
        stageResults.push(lifecycleResult);
        return this.aggregateResult(models_1.InvoiceValidationStage.LIFECYCLE_READINESS, stageResults);
    }
    hasCriticalErrors(errors) {
        return errors.some((error) => error.severity === "CRITICAL");
    }
    aggregateResult(stage, stageResults) {
        return (0, models_1.createInvoiceValidationResult)({
            stage,
            errors: stageResults.flatMap((result) => result.errors),
            warnings: stageResults.flatMap((result) => result.warnings),
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "InvoiceValidationPipeline",
            },
        });
    }
}
exports.InvoiceValidationPipeline = InvoiceValidationPipeline;
//# sourceMappingURL=invoice-validation-pipeline.js.map