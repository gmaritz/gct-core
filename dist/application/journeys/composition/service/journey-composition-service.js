"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyCompositionService = void 0;
const policies_1 = require("../../policies");
const models_1 = require("../models");
function isFulfilled(result) {
    return result.status === "fulfilled";
}
function createMetadata(requestId) {
    return Object.freeze({
        generatedAt: new Date(),
        version: "1.0.0",
        requestId,
    });
}
class JourneyCompositionService {
    constructor(validationPipeline, policyPipeline, accommodationCompositionAdapter, experienceCompositionFramework, journeyFactory) {
        this.validationPipeline = validationPipeline;
        this.policyPipeline = policyPipeline;
        this.accommodationCompositionAdapter = accommodationCompositionAdapter;
        this.experienceCompositionFramework = experienceCompositionFramework;
        this.journeyFactory = journeyFactory;
    }
    async execute(query) {
        const metadata = createMetadata(query.context?.requestId);
        const context = (0, models_1.createJourneyCompositionContext)(query);
        const validationResult = this.validationPipeline.execute(query);
        if (!validationResult.valid) {
            return (0, models_1.createJourneyCompositionResult)({
                success: false,
                payload: null,
                metadata,
                errors: validationResult.errors.map((error) => error.message),
            });
        }
        const policyResults = this.policyPipeline.evaluate(context.policyContext);
        const warnings = policyResults
            .filter((result) => result.outcome === policies_1.JourneyPolicyOutcome.WARNING)
            .flatMap((result) => result.messages);
        const criticalDenial = policyResults.find((result) => result.outcome === policies_1.JourneyPolicyOutcome.DENY && result.priority === policies_1.JourneyPolicyPriority.CRITICAL);
        if (criticalDenial) {
            return (0, models_1.createJourneyCompositionResult)({
                success: false,
                payload: null,
                metadata,
                warnings,
                errors: criticalDenial.messages,
            });
        }
        const [accommodationExecution, experienceExecution] = await Promise.allSettled([
            this.accommodationCompositionAdapter.compose(context.accommodationContext),
            this.experienceCompositionFramework.compose(context.experienceContext),
        ]);
        const compositionWarnings = [...warnings];
        if (!isFulfilled(accommodationExecution)) {
            compositionWarnings.push("Accommodation composition failed.");
        }
        if (!isFulfilled(experienceExecution)) {
            compositionWarnings.push("Experience composition failed.");
        }
        const accommodation = isFulfilled(accommodationExecution)
            ? accommodationExecution.value
            : Object.freeze([]);
        const experiences = isFulfilled(experienceExecution)
            ? experienceExecution.value
            : Object.freeze([]);
        if (!isFulfilled(accommodationExecution) && !isFulfilled(experienceExecution)) {
            return (0, models_1.createJourneyCompositionResult)({
                success: false,
                payload: null,
                metadata,
                warnings: compositionWarnings,
                errors: Object.freeze(["No composition capabilities succeeded."]),
            });
        }
        const journey = this.journeyFactory.create({
            context,
            accommodation,
            experiences,
        });
        const aggregateValidation = this.validationPipeline.execute(query, journey);
        if (!aggregateValidation.valid) {
            return (0, models_1.createJourneyCompositionResult)({
                success: false,
                payload: null,
                metadata,
                warnings: compositionWarnings,
                errors: aggregateValidation.errors.map((error) => error.message),
            });
        }
        return (0, models_1.createJourneyCompositionResult)({
            success: true,
            payload: journey,
            metadata,
            warnings: compositionWarnings,
        });
    }
}
exports.JourneyCompositionService = JourneyCompositionService;
//# sourceMappingURL=journey-composition-service.js.map