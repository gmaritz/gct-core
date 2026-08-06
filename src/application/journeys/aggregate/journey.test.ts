import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
  JourneyComposition,
} from "@application/journeys/aggregate";

function createComposition(): JourneyComposition {
  return {
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
  };
}

describe("Journey aggregate", () => {
  it("constructs an immutable canonical journey aggregate", () => {
    const journey = Journey.create(createComposition());

    expect(journey.identity.id).toBe("journey-001");
    expect(journey.classification.type).toBe("PACKAGE");
    expect(journey.status).toBe(JourneyStatus.DRAFT);
    expect(journey.lifecycle).toBe(JourneyLifecycle.DESIGN);
    expect(journey.destinations).toHaveLength(2);
    expect(journey.accommodation[0]?.name).toBe("Constantia Valley House");
    expect(Object.isFrozen(journey)).toBe(true);
  });

  it("freezes collections and nested value contracts", () => {
    const journey = Journey.create(createComposition());

    expect(Object.isFrozen(journey.identity)).toBe(true);
    expect(Object.isFrozen(journey.classification)).toBe(true);
    expect(Object.isFrozen(journey.metadata)).toBe(true);
    expect(Object.isFrozen(journey.duration)).toBe(true);
    expect(Object.isFrozen(journey.destinations)).toBe(true);
    expect(Object.isFrozen(journey.accommodation)).toBe(true);
    expect(Object.isFrozen(journey.experiences)).toBe(true);
    expect(Object.isFrozen(journey.travellerRules)).toBe(true);
    expect(Object.isFrozen(journey.tags)).toBe(true);
  });

  it("supports restore for canonical composition snapshots", () => {
    const composition = createComposition();
    const journey = Journey.restore(composition);

    expect(journey.identity.id).toBe(composition.identity.id);
    expect(journey.tags.map((tag) => tag.value)).toEqual(["Luxury", "Wine"]);
  });
});