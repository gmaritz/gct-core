import {
  Journey,
  JourneyCompositionQuery,
  JourneyCompositionSource,
  JourneyCompositionStrategy,
  JourneyFactory,
  JourneyLifecycle,
  JourneyStatus,
  JourneyType,
  JourneyValidationPipeline,
} from "@application/journeys";
import {
  JourneyPolicyOutcome,
  JourneyPolicyPipeline,
  JourneyPolicyPriority,
} from "@application/journeys/policies";

import { AccommodationCompositionAdapter } from "./accommodation";
import { ExperienceCompositionFramework } from "./experiences";
import { JourneyCompositionService } from "./service";
import { createJourneyCompositionContext } from "./models";

function createQuery(overrides: Partial<JourneyCompositionQuery> = {}): JourneyCompositionQuery {
  return {
    journeyType: JourneyType.PACKAGE,
    strategy: JourneyCompositionStrategy.STANDARD,
    context: {
      requestId: "req-0037",
      source: JourneyCompositionSource.API,
      timestamp: new Date("2026-08-06T00:00:00.000Z"),
    },
    travellerRequirements: {
      minimumTravellers: 2,
      maximumTravellers: 6,
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
        days: 4,
        nights: 3,
        description: "4 days / 3 nights",
      },
    },
    ...overrides,
  };
}

describe("JourneyFactory", () => {
  it("constructs a journey aggregate with immutable collections", () => {
    const factory = new JourneyFactory();
    const context = createJourneyCompositionContext(createQuery());

    const journey = factory.create({
      context,
      accommodation: [
        {
          accommodationId: "acc-1001",
          name: "Signal Hill Lodge",
        },
      ],
      experiences: [
        {
          experienceId: "exp-1001",
          name: "Private Vineyard Tasting",
        },
      ],
    });

    expect(journey).toBeInstanceOf(Journey);
    expect(journey.identity.id).toBe("journey-req-0037");
    expect(journey.classification.type).toBe(JourneyType.PACKAGE);
    expect(journey.status).toBe(JourneyStatus.DRAFT);
    expect(journey.lifecycle).toBe(JourneyLifecycle.DESIGN);
    expect(journey.destinations[0]?.name).toBe("Cape Town");
    expect(journey.accommodation[0]?.name).toBe("Signal Hill Lodge");
    expect(journey.experiences[0]?.experienceId).toBe("exp-1001");
    expect(Object.isFrozen(journey)).toBe(true);
    expect(Object.isFrozen(journey.accommodation)).toBe(true);
    expect(Object.isFrozen(journey.experiences)).toBe(true);
  });

  it("enforces required destination and request invariants", () => {
    const factory = new JourneyFactory();

    expect(() =>
      factory.create({
        context: createJourneyCompositionContext(
          createQuery({
            destinationRequirements: { destinations: [] },
          }),
        ),
        accommodation: [],
        experiences: [],
      }),
    ).toThrow("Journey factory requires at least one destination.");
  });
});

describe("JourneyCompositionService", () => {
  it("orchestrates validation, policy, adapters, and factory in order", async () => {
    const events: string[] = [];
    const journey = Journey.create({
      identity: { id: "journey-test" },
      classification: { type: "PACKAGE", category: "SIGNATURE" },
      metadata: {
        created: new Date("2026-08-06T00:00:00.000Z"),
        modified: new Date("2026-08-06T00:00:00.000Z"),
        version: "1.0.0",
        source: "APP-003.7",
      },
      status: JourneyStatus.DRAFT,
      lifecycle: JourneyLifecycle.DESIGN,
      duration: { days: 4, nights: 3, description: "4 days / 3 nights" },
      destinations: [{ name: "Cape Town" }],
      accommodation: [{ accommodationId: "acc-1", name: "Signal Hill" }],
      experiences: [{ experienceId: "exp-1", name: "Wine Tasting" }],
      travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
      tags: [],
    });

    const service = new JourneyCompositionService(
      {
        execute: (_query: JourneyCompositionQuery, aggregate?: Journey | null) => {
          events.push(aggregate ? "validation-aggregate" : "validation-query");
          return Object.freeze({ valid: true, errors: Object.freeze([]) });
        },
      } as unknown as JourneyValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return Object.freeze([]);
        },
      } as unknown as JourneyPolicyPipeline,
      {
        compose: async () => {
          events.push("accommodation");
          return Object.freeze([{ accommodationId: "acc-1", name: "Signal Hill" }]);
        },
      } as unknown as AccommodationCompositionAdapter,
      {
        compose: async () => {
          events.push("experience");
          return Object.freeze([{ experienceId: "exp-1", name: "Wine Tasting" }]);
        },
      } as unknown as ExperienceCompositionFramework,
      {
        create: () => {
          events.push("factory");
          return journey;
        },
      } as unknown as JourneyFactory,
    );

    const result = await service.execute(createQuery());

    expect(result.success).toBe(true);
    expect(result.payload).toBe(journey);
    expect(events).toEqual([
      "validation-query",
      "policy",
      "accommodation",
      "experience",
      "factory",
      "validation-aggregate",
    ]);
  });

  it("returns unsuccessful result for validation failures", async () => {
    const service = new JourneyCompositionService(
      {
        execute: () =>
          Object.freeze({
            valid: false,
            errors: Object.freeze([
              Object.freeze({ code: 0, message: "Journey request is required." }),
            ]),
          }),
      } as unknown as JourneyValidationPipeline,
      {
        evaluate: () => Object.freeze([]),
      } as unknown as JourneyPolicyPipeline,
      {
        compose: async () => Object.freeze([]),
      } as unknown as AccommodationCompositionAdapter,
      {
        compose: async () => Object.freeze([]),
      } as unknown as ExperienceCompositionFramework,
      {
        create: () => {
          throw new Error("not called");
        },
      } as unknown as JourneyFactory,
    );

    const result = await service.execute(createQuery());

    expect(result.success).toBe(false);
    expect(result.payload).toBeNull();
    expect(result.errors).toEqual(["Journey request is required."]);
  });

  it("returns unsuccessful result for critical policy denial", async () => {
    const service = new JourneyCompositionService(
      {
        execute: () => Object.freeze({ valid: true, errors: Object.freeze([]) }),
      } as unknown as JourneyValidationPipeline,
      {
        evaluate: () =>
          Object.freeze([
            Object.freeze({
              outcome: JourneyPolicyOutcome.DENY,
              priority: JourneyPolicyPriority.CRITICAL,
              messages: Object.freeze(["Journey not eligible"]),
            }),
          ]),
      } as unknown as JourneyPolicyPipeline,
      {
        compose: async () => {
          throw new Error("not called");
        },
      } as unknown as AccommodationCompositionAdapter,
      {
        compose: async () => {
          throw new Error("not called");
        },
      } as unknown as ExperienceCompositionFramework,
      {
        create: () => {
          throw new Error("not called");
        },
      } as unknown as JourneyFactory,
    );

    const result = await service.execute(createQuery());

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(["Journey not eligible"]);
  });

  it("isolates adapter failures where possible and still composes", async () => {
    const factory = new JourneyFactory();

    const service = new JourneyCompositionService(
      {
        execute: () => Object.freeze({ valid: true, errors: Object.freeze([]) }),
      } as unknown as JourneyValidationPipeline,
      {
        evaluate: () =>
          Object.freeze([
            Object.freeze({
              outcome: JourneyPolicyOutcome.WARNING,
              priority: JourneyPolicyPriority.NORMAL,
              messages: Object.freeze(["Limited itinerary options"]),
            }),
          ]),
      } as unknown as JourneyPolicyPipeline,
      {
        compose: async () => {
          throw new Error("accommodation unavailable");
        },
      } as unknown as AccommodationCompositionAdapter,
      {
        compose: async () => Object.freeze([{ experienceId: "exp-2", name: "Cape Point Tour" }]),
      } as unknown as ExperienceCompositionFramework,
      factory,
    );

    const result = await service.execute(createQuery());

    expect(result.success).toBe(true);
    expect(result.payload?.accommodation).toEqual([]);
    expect(result.payload?.experiences).toEqual([{ experienceId: "exp-2", name: "Cape Point Tour" }]);
    expect(result.warnings).toEqual([
      "Limited itinerary options",
      "Accommodation composition failed.",
    ]);
  });

  it("supports dependency injection with compile-safe contracts", async () => {
    const service: JourneyCompositionService = new JourneyCompositionService(
      {
        execute: () => Object.freeze({ valid: true, errors: Object.freeze([]) }),
      } as unknown as JourneyValidationPipeline,
      {
        evaluate: () => Object.freeze([]),
      } as unknown as JourneyPolicyPipeline,
      {
        compose: async () => Object.freeze([]),
      } as unknown as AccommodationCompositionAdapter,
      {
        compose: async () => Object.freeze([]),
      } as unknown as ExperienceCompositionFramework,
      new JourneyFactory(),
    );

    const result = await service.execute(createQuery());

    expect(typeof service.execute).toBe("function");
    expect(result.metadata.version).toBe("1.0.0");
  });
});