import {
  Accommodation,
  AccommodationAvailabilityResult,
  AccommodationContentResult,
  AccommodationDetailsResult,
  AccommodationImageResult,
  AccommodationResultMetadata,
  AccommodationSearchResult,
} from "@application/accommodation";

describe("Accommodation application result contracts", () => {
  function createCanonicalAccommodation(): Accommodation {
    return {
      identity: {
        id: "acc_1001",
        name: "Constantia Valley House",
      },
      category: "Guest House",
      location: {
        country: "South Africa",
        region: "Western Cape",
        city: "Cape Town",
        suburb: "Constantia",
        latitude: -34.03,
        longitude: 18.42,
      },
      rating: {
        stars: 4,
        classification: "Premium",
      },
      images: [
        {
          id: "image_hero",
          url: "https://cdn.gct.local/accommodation/constantia-valley-house/hero.jpg",
          alt: "Front terrace overlooking the gardens",
          order: 1,
        },
      ],
      amenities: ["Wi-Fi", "Breakfast Included", "Pool"],
      policies: [
        {
          type: "Check-in",
          description: "Check-in from 14:00",
        },
      ],
      contacts: [
        {
          website: "https://constantia-valley-house.example.com",
          email: "reservations@constantia-valley-house.example.com",
        },
      ],
      providerReference: {
        provider: "hotelbeds",
        providerAccommodationId: "HB-1001",
      },
    };
  }

  it("constructs search/details/availability/content results using canonical models and metadata", () => {
    const metadata: AccommodationResultMetadata = {
      provider: "hotelbeds",
      generatedAt: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
    };
    const accommodation = createCanonicalAccommodation();

    const searchResult: AccommodationSearchResult = {
      accommodations: [accommodation],
      metadata,
    };
    const detailsResult: AccommodationDetailsResult = {
      accommodation,
      metadata,
    };
    const availabilityResult: AccommodationAvailabilityResult = {
      accommodation,
      available: true,
      metadata,
    };
    const contentResult: AccommodationContentResult = {
      accommodation,
      metadata,
    };

    expect(searchResult.accommodations).toHaveLength(1);
    expect(detailsResult.accommodation.identity.id).toBe("acc_1001");
    expect(availabilityResult.available).toBe(true);
    expect(contentResult.metadata.version).toBe("1.0.0");
  });

  it("constructs image result with canonical image collection and shared metadata", () => {
    const metadata: AccommodationResultMetadata = {
      generatedAt: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
    };
    const accommodation = createCanonicalAccommodation();

    const imageResult: AccommodationImageResult = {
      accommodationId: accommodation.identity.id,
      images: accommodation.images,
      metadata,
    };

    expect(imageResult.accommodationId).toBe("acc_1001");
    expect(imageResult.images[0]?.id).toBe("image_hero");
    expect(imageResult.metadata.provider).toBeUndefined();
  });

  it("compiles namespace exports for accommodation result contracts", () => {
    const version: AccommodationResultMetadata["version"] = "1.0.0";

    expect(version).toBe("1.0.0");
  });
});
