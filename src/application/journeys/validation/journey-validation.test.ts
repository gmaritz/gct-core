import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
  JourneyType,
} from "@application/journeys/aggregate";

import {
  JourneyAggregateValidator,
  JourneyCompositionQuery,
  JourneyCompositionSource,
  JourneyCompositionStrategy,
  JourneyCompositionValidator,
  JourneyQueryValidator,
  JourneyValidationErrorCode,
  JourneyValidationPipeline,
} from "@application/journeys/validation";

function createQuery(overrides: Partial<JourneyCompositionQuery> = {}): JourneyCompositionQuery {
  return {
    journeyType: JourneyType.PACKAGE,
    strategy: JourneyCompositionStrategy.STANDARD,
    context: {
      requestId: "request-001",
      source: JourneyCompositionSource.API,
      timestamp: new Date("2026-08-05T00:00:00.000Z"),
    },
    travellerRequirements: {
      minimumTravellers: 2,
      maximumTravellers: 8,
      privateOnly: true,
    },
    destinationRequirements: {
      destinations: [
        {
          name: "Cape Town",
        },
      ],
    },
    stayRequirements: {
      duration: {
        days: 5,
        nights: 4,
        description: "5 days / 4 nights",
      },
    },
    ...overrides,
  };
}

function createJourney(): Journey {
  return Journey.create({
    identity: {
      id: "journey-001",
    },
    classification: {
      type: "PACKAGE",
      category: "Signature",
    },
    metadata: {
      created: new Date("2026-08-05T00:00:00.000Z"),
      modified: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
      source: "APP-003.1",
    },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: {
      days: 5,
      nights: 4,
      description: "5 days / 4 nights",
    },
    destinations: [
      {
        name: "Cape Town",
      },
      {
        name: "Stellenbosch",
      },
    ],
    accommodation: [
      {
        accommodationId: "acc-1001",
        name: "Constantia Valley House",
      },
    ],
    experiences: [
      {
        experienceId: "exp-1001",
        name: "Wine Estate Visit",
      },
    ],
    travellerRules: {
      minimumTravellers: 2,
      maximumTravellers: 8,
      privateOnly: true,
    },
    tags: [
      {
        value: "Luxury",
      },
      {
        value: "Wine",
      },
    ],
  });
}

describe("Journey validation pipeline", () => {
  it("validates query contracts and returns immutable results", () => {
    const validator = new JourneyQueryValidator();
    const result = validator.validate(createQuery());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
  });

  it("rejects invalid context and strategy in the query validator", () => {
    const validator = new JourneyQueryValidator();
    const result = validator.validate(
      createQuery({
        context: undefined,
        strategy: "BROKEN" as JourneyCompositionStrategy,
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual([
      JourneyValidationErrorCode.MISSING_CONTEXT,
      JourneyValidationErrorCode.INVALID_STRATEGY,
    ]);
  });

  it("rejects unsupported composition in the composition validator", () => {
    const validator = new JourneyCompositionValidator();
    const result = validator.validate(
      createQuery({
        destinationRequirements: { destinations: [] },
        stayRequirements: {
          duration: {
            days: 1,
            nights: 1,
            description: "1 day / 1 night",
          },
        },
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain(JourneyValidationErrorCode.INVALID_DESTINATION);
    expect(result.errors.map((error) => error.code)).toContain(JourneyValidationErrorCode.INVALID_DURATION);
  });

  it("validates canonical aggregates", () => {
    const validator = new JourneyAggregateValidator();
    const result = validator.validate(createJourney());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects invalid aggregate identity and traveller rules", () => {
    const validator = new JourneyAggregateValidator();
    const result = validator.validate(
      {
        ...createJourney(),
        identity: { id: "" },
        destinations: [],
        travellerRules: {
          minimumTravellers: 0,
          maximumTravellers: 0,
        },
      } as Journey,
    );

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual([
      JourneyValidationErrorCode.MISSING_IDENTITY,
      JourneyValidationErrorCode.INVALID_DESTINATION,
      JourneyValidationErrorCode.INVALID_TRAVELLER_RULES,
    ]);
  });

  it("executes validators sequentially and short-circuits on failure", () => {
    const events: string[] = [];
    const pipeline = new JourneyValidationPipeline({
      queryValidator: {
        validate: () => {
          events.push("query");
          return Object.freeze({ valid: false, errors: Object.freeze([{ code: JourneyValidationErrorCode.INVALID_QUERY, message: "broken" }]) });
        },
      } as JourneyQueryValidator,
      compositionValidator: {
        validate: () => {
          events.push("composition");
          return Object.freeze({ valid: true, errors: Object.freeze([]) });
        },
      } as JourneyCompositionValidator,
      aggregateValidator: {
        validate: () => {
          events.push("aggregate");
          return Object.freeze({ valid: true, errors: Object.freeze([]) });
        },
      } as JourneyAggregateValidator,
    });

    const result = pipeline.execute(createQuery(), createJourney());

    expect(result.valid).toBe(false);
    expect(events).toEqual(["query"]);
  });

  it("returns aggregate validation when request validation succeeds", () => {
    const pipeline = new JourneyValidationPipeline();
    const result = pipeline.execute(createQuery(), createJourney());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});