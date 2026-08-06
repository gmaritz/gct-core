import {
  JourneyAudience,
  JourneyBadge,
  JourneyCategory,
  JourneyCode,
  JourneyDuration,
  JourneyHighlight,
  JourneyIdentity,
  JourneyLifecycle,
  JourneyOperatingSeason,
  JourneySeason,
  JourneySlug,
  JourneyStatus,
  JourneyStayPattern,
  JourneyTag,
  JourneyTheme,
  JourneyType,
} from "@application/journeys/models";

describe("Journey canonical model library", () => {
  it("constructs canonical identity and classification contracts", () => {
    const identity: JourneyIdentity = { id: "journey-001" };
    const code: JourneyCode = "JRN-001";
    const slug: JourneySlug = "cape-town-wine-escape";

    expect(identity.id).toBe("journey-001");
    expect(code).toBe("JRN-001");
    expect(slug).toBe("cape-town-wine-escape");
    expect(JourneyType.PACKAGE).toBe("PACKAGE");
    expect(JourneyCategory.SIGNATURE).toBe("SIGNATURE");
    expect(JourneyTheme.WINE).toBe("WINE");
    expect(JourneyAudience.COUPLES).toBe("COUPLES");
    expect(JourneySeason.ALL_YEAR).toBe("ALL_YEAR");
  });

  it("constructs lifecycle and temporal contracts", () => {
    const duration: JourneyDuration = {
      days: 5,
      nights: 4,
      description: "5 days / 4 nights",
    };
    const season: JourneyOperatingSeason = {
      seasons: [JourneySeason.SUMMER, JourneySeason.SPRING],
      yearRound: false,
    };

    expect(duration.days).toBe(5);
    expect(season.seasons).toEqual([JourneySeason.SUMMER, JourneySeason.SPRING]);
    expect(JourneyStatus.DRAFT).toBe("DRAFT");
    expect(JourneyLifecycle.BOOKABLE).toBe("BOOKABLE");
    expect(JourneyStayPattern.FLEXIBLE).toBe("FLEXIBLE");
  });

  it("constructs experience and marketing contracts", () => {
    const tag: JourneyTag = { value: "Luxury" };
    const badge: JourneyBadge = { value: "Featured" };
    const highlight: JourneyHighlight = { value: "Private tastings" };

    expect(tag.value).toBe("Luxury");
    expect(badge.value).toBe("Featured");
    expect(highlight.value).toBe("Private tastings");
  });
});