"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyValidationPipeline = void 0;
const models_1 = require("../models");
const aggregate_1 = require("../aggregate");
const composition_1 = require("../composition");
const query_1 = require("../query");
class JourneyValidationPipeline {
    constructor(dependencies = {}) {
        this.queryValidator = dependencies.queryValidator ?? new query_1.JourneyQueryValidator();
        this.compositionValidator = dependencies.compositionValidator ?? new composition_1.JourneyCompositionValidator();
        this.aggregateValidator = dependencies.aggregateValidator ?? new aggregate_1.JourneyAggregateValidator();
    }
    execute(query, aggregate) {
        const queryResult = this.queryValidator.validate(query);
        if (!queryResult.valid) {
            return queryResult;
        }
        const compositionResult = this.compositionValidator.validate(query);
        if (!compositionResult.valid) {
            return compositionResult;
        }
        if (typeof aggregate === "undefined" || aggregate === null) {
            return (0, models_1.createJourneyValidationResult)([]);
        }
        return this.aggregateValidator.validate(aggregate);
    }
}
exports.JourneyValidationPipeline = JourneyValidationPipeline;
//# sourceMappingURL=journey-validation-pipeline.js.map