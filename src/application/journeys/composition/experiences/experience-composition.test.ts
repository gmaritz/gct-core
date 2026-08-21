import {
  JourneySeason,
  JourneyType,
} from "@application/journeys/models";

import {
  createExperienceCompositionContext,
  createExperienceSequence,
  ExperienceCompositionContext,
  ExperienceCompositionFramework,
  ExperiencePriority,
  ExperienceSource,
  ExperienceType,
} from "@application/journeys/composition/experiences";

function createContext(): ExperienceCompositionContext {
  return createExperienceCompositionContext({
    destination: "Cape Town",
    journeyType: JourneyType.PACKAGE,
    travellerProfile: {
      adults: 2,
      children: 0,
      privateOnly: true,
      audience: "COUPLES",
    },
    interests: ["WINE", "SCENIC"],
    duration: {
      days: 4,
      nights: 3,
      description: "4 days / 3 nights",
    },
    operatingSeason: {
      seasons: [JourneySeason.SUMMER, JourneySeason.SPRING],
      yearRound: false,
    },
    requestedAt: new Date("2026-08-06T00:00:00.000Z"),
  });
}

describe("ExperienceCompositionFramework", () => {
  it("constructs and composes immutable journey experiences", async () => {
    const framework = new ExperienceCompositionFramework({
      resolve: async (): Promise<ReadonlyArray<{
        readonly experienceId: string;
        readonly name: string;
        readonly source: ExperienceSource;
        readonly type: ExperienceType;
        readonly priority: ExperiencePriority;
        readonly sequence: ReturnType<typeof createExperienceSequence>;
      }>> => [
        {
          experienceId: "exp-2002",
          name: "Sunset Coastal Drive",
          source: ExperienceSource.CURATED,
          type: ExperienceType.SCENIC,
          priority: ExperiencePriority.SECONDARY,
          sequence: createExperienceSequence({ day: 2, order: 2, itineraryLabel: "Late afternoon" }),
        },
        {
          experienceId: "exp-2001",
          name: "Private Vineyard Tasting",
          source: ExperienceSource.CURATED,
          type: ExperienceType.WINE,
          priority: ExperiencePriority.PRIMARY,
          sequence: createExperienceSequence({ day: 1, order: 1, itineraryLabel: "Morning" }),
        },
      ],
    });

    const result = await framework.compose(createContext());

    expect(result).toEqual([
      {
        experienceId: "exp-2001",
        name: "Private Vineyard Tasting",
      },
      {
        experienceId: "exp-2002",
        name: "Sunset Coastal Drive",
      },
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
  });

  it("returns empty immutable results with default provider", async () => {
    const framework = new ExperienceCompositionFramework();

    const result = await framework.compose(createContext());

    expect(result).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("creates immutable context and sequence models", () => {
    const context = createContext();
    const sequence = createExperienceSequence({ day: 1, order: 1, itineraryLabel: "Morning" });

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.travellerProfile)).toBe(true);
    expect(Object.isFrozen(context.interests)).toBe(true);
    expect(Object.isFrozen(context.duration)).toBe(true);
    expect(Object.isFrozen(context.operatingSeason)).toBe(true);
    expect(Object.isFrozen(context.operatingSeason?.seasons)).toBe(true);
    expect(Object.isFrozen(sequence)).toBe(true);
  });

  it("exposes compile-safe enums and contracts", async () => {
    const framework = new ExperienceCompositionFramework({
      resolve: (): ReadonlyArray<{
        readonly experienceId: string;
        readonly name: string;
        readonly source: ExperienceSource;
        readonly type: ExperienceType;
        readonly priority: ExperiencePriority;
        readonly sequence: ReturnType<typeof createExperienceSequence>;
      }> => [
        {
          experienceId: "exp-3001",
          name: "Table Mountain Cableway",
          source: ExperienceSource.PARTNER,
          type: ExperienceType.ACTIVITY,
          priority: ExperiencePriority.OPTIONAL,
          sequence: createExperienceSequence({ day: 3, order: 1 }),
        },
      ],
    });

    const result = await framework.compose(createContext());

    expect(result[0]?.experienceId).toBe("exp-3001");
    expect(ExperienceSource.AI).toBe("AI");
    expect(ExperienceType.EVENT).toBe("EVENT");
    expect(ExperiencePriority.PRIMARY).toBe("PRIMARY");
  });
});