import { ApplicationService } from "../../../application-service";
import {
  JourneyPolicyOutcome,
  JourneyPolicyPipeline,
  JourneyPolicyPriority,
} from "../../policies";
import {
  JourneyCompositionQuery,
  JourneyValidationPipeline,
} from "../../validation";
import {
  AccommodationCompositionAdapter,
} from "../accommodation";
import {
  ExperienceCompositionFramework,
} from "../experiences";
import {
  createJourneyCompositionContext,
  createJourneyCompositionResult,
  JourneyCompositionResult,
} from "../models";
import { JourneyFactory } from "../factory";

function isFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

function createMetadata(requestId: string | undefined): JourneyCompositionResult["metadata"] {
  return Object.freeze({
    generatedAt: new Date(),
    version: "1.0.0",
    requestId,
  });
}

export class JourneyCompositionService
  implements ApplicationService<JourneyCompositionQuery, JourneyCompositionResult>
{
  public constructor(
    private readonly validationPipeline: JourneyValidationPipeline,
    private readonly policyPipeline: JourneyPolicyPipeline,
    private readonly accommodationCompositionAdapter: AccommodationCompositionAdapter,
    private readonly experienceCompositionFramework: ExperienceCompositionFramework,
    private readonly journeyFactory: JourneyFactory,
  ) {}

  public async execute(query: JourneyCompositionQuery): Promise<JourneyCompositionResult> {
    const metadata = createMetadata(query.context?.requestId);
    const context = createJourneyCompositionContext(query);

    const validationResult = this.validationPipeline.execute(query);

    if (!validationResult.valid) {
      return createJourneyCompositionResult({
        success: false,
        payload: null,
        metadata,
        errors: validationResult.errors.map((error) => error.message),
      });
    }

    const policyResults = this.policyPipeline.evaluate(context.policyContext);

    const warnings = policyResults
      .filter((result) => result.outcome === JourneyPolicyOutcome.WARNING)
      .flatMap((result) => result.messages);

    const criticalDenial = policyResults.find(
      (result) => result.outcome === JourneyPolicyOutcome.DENY && result.priority === JourneyPolicyPriority.CRITICAL,
    );

    if (criticalDenial) {
      return createJourneyCompositionResult({
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
      return createJourneyCompositionResult({
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
      return createJourneyCompositionResult({
        success: false,
        payload: null,
        metadata,
        warnings: compositionWarnings,
        errors: aggregateValidation.errors.map((error) => error.message),
      });
    }

    return createJourneyCompositionResult({
      success: true,
      payload: journey,
      metadata,
      warnings: compositionWarnings,
    });
  }
}