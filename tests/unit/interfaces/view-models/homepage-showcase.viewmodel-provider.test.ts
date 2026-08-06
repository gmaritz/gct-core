import {
  HomepageJourneyShowcaseResult,
  HomepageMerchandisingResult,
  HomepageMerchandisingService,
} from "@application/merchandising";
import { getHomepageShowcaseViewModel } from "@interfaces/view-models";

class HomepageMerchandisingServiceSpy implements HomepageMerchandisingService {
  called = 0;

  async getHomepageMerchandising(): Promise<HomepageMerchandisingResult> {
    this.called += 1;

    return {
      editorial: {
        eyebrow: "Curated Private Journeys",
        heading: "Discover South Africa Through Carefully Curated Journeys.",
        narrative:
          "From the vineyards of Stellenbosch to the coastline of the Garden Route, every Go Cape Tours journey combines exceptional accommodation, authentic experiences and local expertise to create unforgettable memories.",
        primaryCallToActionLabel: "Explore Experiences",
        primaryCallToActionHref: "#featured-experiences",
        secondaryCallToActionLabel: "Plan Your Journey",
        secondaryCallToActionHref: "#journey-planning",
      },
      journeys: [
        {
          id: "luxury-winelands-escape",
          title: "Luxury Winelands Escape",
          destination: "Cape Winelands",
          duration: "4 Days / 3 Nights",
          imageLabel: "Luxury Winelands landscape",
          highlights: [
            "Private cellar experiences",
            "Boutique lodges",
            "Curated culinary route",
          ],
          priceDisplay: "From R18 950 per couple",
          savingDisplay: "Save 22%",
          primaryCallToActionLabel: "View Journey",
          primaryCallToActionHref: "#journey-planning",
          isPrimary: true,
        },
        {
          id: "ocean-vineyard-retreat",
          title: "Ocean & Vineyard Retreat",
          destination: "Atlantic Seaboard",
          duration: "3 Days / 2 Nights",
          imageLabel: "Coastal journey landscape",
          highlights: ["Coastal estates", "Sunset tastings", "Private guide"],
          priceDisplay: "From R12 400 per couple",
          savingDisplay: "Save 18%",
          primaryCallToActionLabel: "View Journey",
          primaryCallToActionHref: "#journey-planning",
          isPrimary: false,
        },
        {
          id: "mountain-valley-signature",
          title: "Mountain Valley Signature",
          destination: "Franschhoek Valley",
          duration: "5 Days / 4 Nights",
          imageLabel: "Mountain and valley journey landscape",
          highlights: ["Scenic rail moments", "Chef tables", "Private transfers"],
          priceDisplay: "From R21 300 per couple",
          savingDisplay: "Save 15%",
          primaryCallToActionLabel: "View Journey",
          primaryCallToActionHref: "#journey-planning",
          isPrimary: false,
        },
      ],
      metadata: {
        generatedAt: new Date("2026-08-05T00:00:00.000Z"),
        version: "1.0.0",
        source: "placeholder",
      },
    };
  }
}

class HomepageJourneyShowcaseServiceSpy {
  called = 0;

  async execute(): Promise<HomepageJourneyShowcaseResult> {
    this.called += 1;

    return {
      success: true,
      featuredJourneys: [
        {
          id: "journey-001",
          title: "Signature Cape Winelands Journey",
          subtitle: "PACKAGE experience for curated travel",
          destination: "Cape Winelands",
          duration: "4 Days / 3 Nights",
          image: {
            src: "data:image/svg+xml,journey-001",
            alt: "Journey hero",
            width: 1280,
            height: 720,
          },
          highlights: [
            "Private cellar experiences",
            "Boutique lodges",
            "Curated culinary route",
          ],
          accommodationSummary: "1 accommodation option",
          experienceSummary: "2 experiences",
          badges: ["SIGNATURE", "DRAFT"],
          primaryCTA: {
            label: "View Journey",
            href: "#journey-journey-001",
            style: "primary",
          },
        },
        {
          id: "journey-002",
          title: "Signature Atlantic Seaboard Journey",
          subtitle: "PACKAGE experience for curated travel",
          destination: "Atlantic Seaboard",
          duration: "3 Days / 2 Nights",
          image: {
            src: "data:image/svg+xml,journey-002",
            alt: "Journey hero two",
            width: 1280,
            height: 720,
          },
          highlights: ["Coastal estates", "Sunset tastings", "Private guide"],
          accommodationSummary: "1 accommodation option",
          experienceSummary: "2 experiences",
          badges: ["SIGNATURE", "DRAFT"],
          primaryCTA: {
            label: "View Journey",
            href: "#journey-journey-002",
            style: "primary",
          },
        },
        {
          id: "journey-003",
          title: "Luxury Franschhoek Valley Journey",
          subtitle: "PRIVATE experience for curated travel",
          destination: "Franschhoek Valley",
          duration: "5 Days / 4 Nights",
          image: {
            src: "data:image/svg+xml,journey-003",
            alt: "Journey hero three",
            width: 1280,
            height: 720,
          },
          highlights: ["Scenic rail moments", "Chef tables", "Private transfers"],
          accommodationSummary: "1 accommodation option",
          experienceSummary: "2 experiences",
          badges: ["LUXURY", "DRAFT"],
          primaryCTA: {
            label: "View Journey",
            href: "#journey-journey-003",
            style: "primary",
          },
        },
      ],
      metadata: {
        generatedAt: new Date("2026-08-06T00:00:00.000Z"),
        version: "1.0.0",
      },
    };
  }
}

describe("getHomepageShowcaseViewModel", () => {
  it("requests HomepageMerchandisingService and builds the homepage showcase presentation contract", async () => {
    const service = new HomepageMerchandisingServiceSpy();
    const showcaseService = new HomepageJourneyShowcaseServiceSpy();
    const viewModel = await getHomepageShowcaseViewModel(service, showcaseService);

    expect(service.called).toBe(1);
    expect(showcaseService.called).toBe(1);

    expect(viewModel.editorial.eyebrow).toBe("Curated Private Journeys");
    expect(viewModel.editorial.heading).toContain("Carefully Curated Journeys");
    expect(viewModel.editorial.primaryCTA.label).toBe("Explore Experiences");
    expect(viewModel.editorial.secondaryCTA.label).toBe("Plan Your Journey");
    expect(viewModel.metadata.version).toBe("1.0.0");
    expect(viewModel.journeys).toHaveLength(3);
    expect(viewModel.journeys[0].title).toBe("Signature Cape Winelands Journey");
    expect(viewModel.journeys[0].image.alt).toBe("Journey hero");
    expect(viewModel.journeys[0].price.display).toBe("Price on request");
    expect(viewModel.journeys[0].saving.display).toBe("Curated Journey");
    expect(viewModel.journeys[0].primaryCTA.label).toBe("View Journey");
    expect(viewModel.journeys[0].variant).toBe("primary");
    expect(viewModel.journeys[1].variant).toBe("secondary");
    expect(viewModel.journeys[1].highlights).toContain("Sunset tastings");
  });
});
