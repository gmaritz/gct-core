import { Journey } from "../../aggregate";

import { JourneyValidationResult, createJourneyValidationResult } from "../models";
import { JourneyAggregateValidator } from "../aggregate";
import { JourneyCompositionValidator } from "../composition";
import { JourneyCompositionQuery, JourneyQueryValidator } from "../query";

export interface JourneyValidationPipelineDependencies {
  readonly queryValidator?: JourneyQueryValidator;
  readonly compositionValidator?: JourneyCompositionValidator;
  readonly aggregateValidator?: JourneyAggregateValidator;
}

export class JourneyValidationPipeline {
  private readonly queryValidator: JourneyQueryValidator;
  private readonly compositionValidator: JourneyCompositionValidator;
  private readonly aggregateValidator: JourneyAggregateValidator;

  public constructor(dependencies: JourneyValidationPipelineDependencies = {}) {
    this.queryValidator = dependencies.queryValidator ?? new JourneyQueryValidator();
    this.compositionValidator = dependencies.compositionValidator ?? new JourneyCompositionValidator();
    this.aggregateValidator = dependencies.aggregateValidator ?? new JourneyAggregateValidator();
  }

  public execute(query: JourneyCompositionQuery, aggregate?: Journey | null): JourneyValidationResult {
    const queryResult = this.queryValidator.validate(query);

    if (!queryResult.valid) {
      return queryResult;
    }

    const compositionResult = this.compositionValidator.validate(query);

    if (!compositionResult.valid) {
      return compositionResult;
    }

    if (typeof aggregate === "undefined" || aggregate === null) {
      return createJourneyValidationResult([]);
    }

    return this.aggregateValidator.validate(aggregate);
  }
}