import {
  createPlaceholderHomepageMerchandisingPolicies,
  DefaultHomepageMerchandisingService,
  HomepageMerchandisingService,
} from "@application/merchandising";

describe("HomepageMerchandisingService", () => {
  it("supports namespace imports and service construction", () => {
    const service: HomepageMerchandisingService = new DefaultHomepageMerchandisingService();

    expect(service).toBeDefined();
  });

  it("returns placeholder merchandising result through the stable service contract", async () => {
    const service: HomepageMerchandisingService = new DefaultHomepageMerchandisingService();
    const result = await service.getHomepageMerchandising();

    expect(result.editorial.heading).toContain("Carefully Curated Journeys");
    expect(result.journeys.map((journey) => journey.title)).toEqual([
      "Luxury Winelands Escape",
      "Ocean & Vineyard Retreat",
      "Mountain Valley Signature",
    ]);
    expect(result.metadata.version).toBe("1.0.0");
  });

  it("registers all placeholder policy contracts", () => {
    const policies = createPlaceholderHomepageMerchandisingPolicies();

    expect(policies.campaignPolicy).toBeDefined();
    expect(policies.seasonalPriorityPolicy).toBeDefined();
    expect(policies.journeyEligibilityPolicy).toBeDefined();
    expect(policies.featuredJourneyPolicy).toBeDefined();
    expect(policies.collectionPolicy).toBeDefined();
  });
});
