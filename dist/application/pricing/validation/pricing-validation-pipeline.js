"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingValidationPipeline = void 0;
const models_1 = require("./models");
class PricingValidationPipeline {
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    execute(request) {
        const results = [];
        const requestResult = this.dependencies.requestValidator.validate(request);
        results.push(requestResult);
        if (this.hasCriticalErrors(requestResult.errors)) {
            return this.aggregateResults(models_1.PricingValidationStage.REQUEST, results);
        }
        const commercialResult = this.dependencies.commercialValidator.validate(request);
        results.push(commercialResult);
        if (this.hasCriticalErrors(commercialResult.errors)) {
            return this.aggregateResults(models_1.PricingValidationStage.COMMERCIAL, results);
        }
        const integrityResult = this.dependencies.integrityValidator.validate(request);
        results.push(integrityResult);
        if (this.hasCriticalErrors(integrityResult.errors)) {
            return this.aggregateResults(models_1.PricingValidationStage.INTEGRITY, results);
        }
        const quoteReadinessResult = this.dependencies.quoteReadinessValidator.validate(request);
        results.push(quoteReadinessResult);
        return this.aggregateResults(models_1.PricingValidationStage.QUOTE_READINESS, results);
    }
    hasCriticalErrors(errors) {
        return errors.some((error) => error.critical);
    }
    aggregateResults(stage, stageResults) {
        return (0, models_1.createPricingValidationResult)({
            stage,
            errors: stageResults.flatMap((result) => result.errors),
            warnings: stageResults.flatMap((result) => result.warnings),
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "PricingValidationPipeline",
            },
        });
    }
}
exports.PricingValidationPipeline = PricingValidationPipeline;
//# sourceMappingURL=pricing-validation-pipeline.js.map