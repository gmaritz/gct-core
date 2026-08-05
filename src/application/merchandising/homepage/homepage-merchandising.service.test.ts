import {
  createPlaceholderHomepageMerchandisingPolicies,
  HomepageMerchandisingPolicies,
} from "../policies";
import {
  DefaultHomepageMerchandisingService,
  HomepageMerchandisingService,
} from "./homepage-merchandising.service";

describe("DefaultHomepageMerchandisingService", () => {
  it("constructs with default placeholder policies", () => {
    const service = new DefaultHomepageMerchandisingService();

    expect(service).toBeDefined();
    expect(service.policies).toEqual(createPlaceholderHomepageMerchandisingPolicies());
  });

  it("supports dependency injection for policy registry", () => {
    const policyRegistry: HomepageMerchandisingPolicies = {
      campaignPolicy: {},
      seasonalPriorityPolicy: {},
      journeyEligibilityPolicy: {},
      featuredJourneyPolicy: {},
      collectionPolicy: {},
    };

    const service = new DefaultHomepageMerchandisingService(policyRegistry);

    expect(service.policies).toBe(policyRegistry);
  });

  it("returns stable placeholder merchandising output", async () => {
    const service: HomepageMerchandisingService = new DefaultHomepageMerchandisingService();
    const result = await service.getHomepageMerchandising();

    expect(result.editorial.eyebrow).toBe("Curated Private Journeys");
    expect(result.editorial.heading).toContain("Carefully Curated Journeys");
    expect(result.journeys).toHaveLength(3);
    expect(result.journeys[0].title).toBe("Luxury Winelands Escape");
    expect(result.journeys[0].isPrimary).toBe(true);
    expect(result.journeys[1].title).toBe("Ocean & Vineyard Retreat");
    expect(result.journeys[2].title).toBe("Mountain Valley Signature");
    expect(result.metadata.version).toBe("1.0.0");
    expect(result.metadata.source).toBe("placeholder");
    expect(result.metadata.generatedAt.toISOString()).toBe("2026-08-05T00:00:00.000Z");
  });

  it("returns new object instances to remain mutation-safe and stateless", async () => {
    const service = new DefaultHomepageMerchandisingService();
    const first = await service.getHomepageMerchandising();
    const second = await service.getHomepageMerchandising();

    expect(second).not.toBe(first);
    expect(second.editorial).not.toBe(first.editorial);
    expect(second.journeys).not.toBe(first.journeys);
    expect(second.journeys[0]).not.toBe(first.journeys[0]);
    expect(second.journeys[0].highlights).not.toBe(first.journeys[0].highlights);
    expect(second.metadata).not.toBe(first.metadata);
    expect(second.metadata.generatedAt).not.toBe(first.metadata.generatedAt);
  });
});
