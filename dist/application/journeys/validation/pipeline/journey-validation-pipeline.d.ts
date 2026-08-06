import { Journey } from "../../aggregate";
import { JourneyValidationResult } from "../models";
import { JourneyAggregateValidator } from "../aggregate";
import { JourneyCompositionValidator } from "../composition";
import { JourneyCompositionQuery, JourneyQueryValidator } from "../query";
export interface JourneyValidationPipelineDependencies {
    readonly queryValidator?: JourneyQueryValidator;
    readonly compositionValidator?: JourneyCompositionValidator;
    readonly aggregateValidator?: JourneyAggregateValidator;
}
export declare class JourneyValidationPipeline {
    private readonly queryValidator;
    private readonly compositionValidator;
    private readonly aggregateValidator;
    constructor(dependencies?: JourneyValidationPipelineDependencies);
    execute(query: JourneyCompositionQuery, aggregate?: Journey | null): JourneyValidationResult;
}
//# sourceMappingURL=journey-validation-pipeline.d.ts.map