import { JourneyType } from "@application/journeys/models";
import {
  JourneyCompositionSource,
  JourneyCompositionStrategy,
} from "@application/journeys/validation";
import {
  createJourneyPolicyResult,
  JourneyAccommodationPolicy,
  JourneyCompositionPolicyContext,
  JourneyDurationPolicy,
  JourneyEligibilityPolicy,
  JourneyExperiencePolicy,
  JourneyPolicy,
  JourneyPolicyOutcome,
  JourneyPolicyPipeline,
  JourneyPolicyPriority,
  JourneyPolicyRegistry,
  JourneyPolicyResult,
  JourneySeasonPolicy,
} from "@application/journeys/policies";

function createContext(): JourneyCompositionPolicyContext {
  return Object.freeze({
    query: {
      journeyType: JourneyType.PACKAGE,
      strategy: JourneyCompositionStrategy.STANDARD,
      context: {
        requestId: "request-0034",
        source: JourneyCompositionSource.API,
        timestamp: new Date("2026-08-06T00:00:00.000Z"),
      },
      travellerRequirements: {
        minimumTravellers: 2,
        maximumTravellers: 6,
      },
      destinationRequirements: {
        destinations: [{ name: "Cape Town" }],
      },
      stayRequirements: {
        duration: {
          days: 4,
          nights: 3,
          description: "4 days / 3 nights",
        },
      },
    },
  });
}

function createPolicyResult(
  outcome: JourneyPolicyOutcome,
  priority: JourneyPolicyPriority,
  messages: ReadonlyArray<string>,
): JourneyPolicyResult {
  return createJourneyPolicyResult(outcome, priority, messages);
}

describe("JourneyPolicyRegistry", () => {
  it("registers and resolves policies", () => {
    const registry = new JourneyPolicyRegistry();
    const policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["ok"]),
    };

    registry.register("eligibility", policy, JourneyPolicyPriority.HIGH);

    const resolved = registry.resolve("eligibility");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("eligibility");
    expect(resolved?.priority).toBe(JourneyPolicyPriority.HIGH);
    expect(resolved?.policy).toBe(policy);
  });

  it("rejects duplicate policy registration", () => {
    const registry = new JourneyPolicyRegistry();
    const policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["ok"]),
    };

    registry.register("eligibility", policy, JourneyPolicyPriority.NORMAL);

    expect(() => registry.register("eligibility", policy, JourneyPolicyPriority.HIGH)).toThrow(
      "Journey policy 'eligibility' is already registered.",
    );
  });

  it("unregisters policies", () => {
    const registry = new JourneyPolicyRegistry();
    const policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["ok"]),
    };

    registry.register("duration", policy, JourneyPolicyPriority.NORMAL);

    expect(registry.unregister("duration")).toBe(true);
    expect(registry.resolve("duration")).toBeUndefined();
    expect(registry.unregister("duration")).toBe(false);
  });

  it("resolves all policies in deterministic priority order with immutable output", () => {
    const registry = new JourneyPolicyRegistry();

    registry.register("normal", { evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["normal"]) }, JourneyPolicyPriority.NORMAL);
    registry.register("critical", { evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.CRITICAL, ["critical"]) }, JourneyPolicyPriority.CRITICAL);
    registry.register("high", { evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.HIGH, ["high"]) }, JourneyPolicyPriority.HIGH);
    registry.register("low", { evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.LOW, ["low"]) }, JourneyPolicyPriority.LOW);

    const registrations = registry.resolveAll();

    expect(registrations.map((registration) => registration.name)).toEqual([
      "critical",
      "high",
      "normal",
      "low",
    ]);
    expect(Object.isFrozen(registrations)).toBe(true);
    expect(Object.isFrozen(registrations[0])).toBe(true);
  });
});

describe("JourneyPolicyPipeline", () => {
  it("executes policies in priority order", () => {
    const registry = new JourneyPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "normal",
      {
        evaluate: () => {
          events.push("normal");
          return createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["normal"]);
        },
      },
      JourneyPolicyPriority.NORMAL,
    );

    registry.register(
      "critical",
      {
        evaluate: () => {
          events.push("critical");
          return createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.CRITICAL, ["critical"]);
        },
      },
      JourneyPolicyPriority.CRITICAL,
    );

    registry.register(
      "high",
      {
        evaluate: () => {
          events.push("high");
          return createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.HIGH, ["high"]);
        },
      },
      JourneyPolicyPriority.HIGH,
    );

    const pipeline = new JourneyPolicyPipeline(registry);

    const results = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical", "high", "normal"]);
    expect(results).toHaveLength(3);
  });

  it("short-circuits on critical denial", () => {
    const registry = new JourneyPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "critical-deny",
      {
        evaluate: () => {
          events.push("critical-deny");
          return createPolicyResult(JourneyPolicyOutcome.DENY, JourneyPolicyPriority.CRITICAL, ["stop"]);
        },
      },
      JourneyPolicyPriority.CRITICAL,
    );

    registry.register(
      "high",
      {
        evaluate: () => {
          events.push("high");
          return createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.HIGH, ["unreached"]);
        },
      },
      JourneyPolicyPriority.HIGH,
    );

    const pipeline = new JourneyPolicyPipeline(registry);

    const results = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical-deny"]);
    expect(results).toHaveLength(1);
    expect(results[0]?.outcome).toBe(JourneyPolicyOutcome.DENY);
    expect(results[0]?.priority).toBe(JourneyPolicyPriority.CRITICAL);
  });

  it("returns immutable pipeline results", () => {
    const registry = new JourneyPolicyRegistry();

    registry.register(
      "normal",
      {
        evaluate: () => ({
          outcome: JourneyPolicyOutcome.WARNING,
          priority: JourneyPolicyPriority.NORMAL,
          messages: ["watch"],
        }),
      },
      JourneyPolicyPriority.NORMAL,
    );

    const pipeline = new JourneyPolicyPipeline(registry);
    const results = pipeline.evaluate(createContext());

    expect(Object.isFrozen(results)).toBe(true);
    expect(Object.isFrozen(results[0])).toBe(true);
    expect(Object.isFrozen(results[0]?.messages)).toBe(true);
  });
});

describe("Journey policy contracts", () => {
  it("exposes initial journey policy contracts with compile-safe signatures", () => {
    const eligibility: JourneyEligibilityPolicy = {
      evaluate: (context) => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.HIGH, [context.query.journeyType ?? ""]),
    };
    const duration: JourneyDurationPolicy = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["duration"]),
    };
    const accommodation: JourneyAccommodationPolicy = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.IGNORE, JourneyPolicyPriority.LOW, ["accommodation"]),
    };
    const experience: JourneyExperiencePolicy = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.WARNING, JourneyPolicyPriority.NORMAL, ["experience"]),
    };
    const season: JourneySeasonPolicy = {
      evaluate: () => createPolicyResult(JourneyPolicyOutcome.ALLOW, JourneyPolicyPriority.NORMAL, ["season"]),
    };

    expect(typeof eligibility.evaluate).toBe("function");
    expect(typeof duration.evaluate).toBe("function");
    expect(typeof accommodation.evaluate).toBe("function");
    expect(typeof experience.evaluate).toBe("function");
    expect(typeof season.evaluate).toBe("function");
  });
});