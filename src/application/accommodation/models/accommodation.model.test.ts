import {
  Accommodation,
  AccommodationAmenity,
  AccommodationCategory,
  AccommodationPolicy,
} from "@application/accommodation";

describe("Canonical accommodation model", () => {
  it("supports aggregate composition using canonical value models", () => {
    const category: AccommodationCategory = "Boutique Hotel";
    const amenities: ReadonlyArray<AccommodationAmenity> = ["Wi-Fi", "Pool", "Restaurant"];
    const policies: ReadonlyArray<AccommodationPolicy> = [
      {
        type: "Check-in",
        description: "Check-in from 14:00",
      },
      {
        type: "Cancellation Policy",
        description: "Free cancellation up to 72 hours before check-in",
      },
    ];

    const accommodation: Accommodation = {
      identity: {
        id: "acc_001",
        name: "Vineyard Manor Retreat",
      },
      category,
      location: {
        country: "South Africa",
        region: "Western Cape",
        city: "Cape Town",
        suburb: "Constantia",
        latitude: -34.029,
        longitude: 18.417,
      },
      rating: {
        stars: 5,
        classification: "Luxury",
        reviewScore: 9.2,
      },
      images: [
        {
          id: "img_hero",
          url: "https://cdn.gct.local/accommodation/vineyard-manor/hero.jpg",
          alt: "Vineyard Manor main building",
          order: 1,
        },
      ],
      amenities,
      policies,
      contacts: [
        {
          website: "https://vineyard-manor.example.com",
          email: "stay@vineyard-manor.example.com",
          telephone: "+27-21-555-0100",
        },
      ],
      providerReference: {
        provider: "hotelbeds",
        providerAccommodationId: "HB-987654",
      },
    };

    expect(accommodation.identity.id).toBe("acc_001");
    expect(accommodation.category).toBe("Boutique Hotel");
    expect(accommodation.amenities).toContain("Pool");
    expect(accommodation.providerReference.providerAccommodationId).toBe("HB-987654");
  });

  it("compiles namespace exports for canonical accommodation models", () => {
    const category: AccommodationCategory = "Villa";

    expect(category).toBe("Villa");
  });
});
