import {
  HotelMapper,
  HotelbedsAddress,
  HotelbedsFacility,
  HotelbedsHotel,
  HotelbedsImage,
  HotelbedsLocation,
  mapHotelbedsAddress,
  mapHotelbedsFacilities,
  mapHotelbedsIdentity,
  mapHotelbedsImages,
  mapHotelbedsLocation,
  mapHotelbedsProviderReference,
  mapHotelbedsRating,
} from "@application/accommodation";

describe("Hotelbeds mapping library", () => {
  it("maps identity from Hotelbeds hotel contract", () => {
    const hotel: HotelbedsHotel = {
      code: 123223,
      name: "Axor Feria",
    };

    const identity = mapHotelbedsIdentity(hotel);

    expect(identity.id).toBe("123223");
    expect(identity.name).toBe("Axor Feria");
  });

  it("maps address into canonical contact where applicable", () => {
    const address: HotelbedsAddress = {
      email: "stay@hotel.example.com",
      phones: ["+34-900-111-222", "+34-900-333-444"],
    };

    const contact = mapHotelbedsAddress(address);

    expect(contact?.email).toBe("stay@hotel.example.com");
    expect(contact?.telephone).toBe("+34-900-111-222");
  });

  it("maps location fields structurally into canonical location", () => {
    const location: HotelbedsLocation = {
      countryCode: "ES",
      stateCode: "MD",
      city: "Madrid",
      zoneName: "Barajas-Ifema",
      latitude: "40.4480116",
      longitude: "-3.5832076",
    };

    const mapped = mapHotelbedsLocation(location);

    expect(mapped.country).toBe("ES");
    expect(mapped.region).toBe("MD");
    expect(mapped.city).toBe("Madrid");
    expect(mapped.suburb).toBe("Barajas-Ifema");
    expect(mapped.latitude).toBeCloseTo(40.4480116, 8);
    expect(mapped.longitude).toBeCloseTo(-3.5832076, 8);
  });

  it("maps rating fields from category and reviews", () => {
    const hotel: HotelbedsHotel = {
      categoryCode: "4EST",
      categoryName: "4 STARS",
      reviews: [
        {
          type: "HOTELBEDS",
          rate: "4.2",
        },
      ],
    };

    const rating = mapHotelbedsRating(hotel);

    expect(rating.stars).toBe(4);
    expect(rating.classification).toBe("4 STARS");
    expect(rating.reviewScore).toBe(4.2);
  });

  it("maps images while preserving source order", () => {
    const images: ReadonlyArray<HotelbedsImage> = [
      {
        path: "https://cdn.hotelbeds/a.jpg",
        order: 10,
        description: [{ content: "Image A" }],
      },
      {
        path: "https://cdn.hotelbeds/b.jpg",
        order: 20,
        description: [{ content: "Image B" }],
      },
    ];

    const mapped = mapHotelbedsImages(images);

    expect(mapped).toHaveLength(2);
    expect(mapped[0]?.url).toBe("https://cdn.hotelbeds/a.jpg");
    expect(mapped[1]?.url).toBe("https://cdn.hotelbeds/b.jpg");
    expect(mapped[0]?.order).toBe(10);
    expect(mapped[1]?.order).toBe(20);
  });

  it("maps facilities structurally without enrichment", () => {
    const facilities: ReadonlyArray<HotelbedsFacility> = [
      {
        facilityName: "Wi-Fi",
      },
      {
        facilityCode: 999,
      },
    ];

    const amenities = mapHotelbedsFacilities(facilities);

    expect(amenities).toEqual(["Wi-Fi", "999"]);
  });

  it("creates provider reference using supplier identifier and accommodation id", () => {
    const providerReference = mapHotelbedsProviderReference({
      code: 716,
    });

    expect(providerReference.provider).toBe("hotelbeds");
    expect(providerReference.providerAccommodationId).toBe("716");
  });

  it("composes specialized mappers into canonical accommodation aggregate", () => {
    const mapper = new HotelMapper();
    const hotel: HotelbedsHotel = {
      code: 8629,
      name: "Saulo By Puro",
      categoryName: "Guest House",
      categoryCode: "4EST",
      destinationCode: "PMI",
      destinationName: "Majorca",
      zoneName: "Ca'n Pastilla",
      latitude: "39.5338636",
      longitude: "2.722382421",
      address: {
        email: "bookings@saulo.example.com",
        phones: ["+34-900-555-010"],
      },
      facilities: [
        {
          facilityName: "Pool",
        },
      ],
      images: [
        {
          path: "https://cdn.hotelbeds/saulo/hero.jpg",
          order: 1,
          description: [{ content: "Saulo hero image" }],
        },
      ],
    };

    const accommodation = mapper.mapHotel(hotel);

    expect(accommodation.identity.id).toBe("8629");
    expect(accommodation.identity.name).toBe("Saulo By Puro");
    expect(accommodation.category).toBe("Guest House");
    expect(accommodation.location.city).toBe("");
    expect(accommodation.location.latitude).toBeCloseTo(39.5338636, 8);
    expect(accommodation.images[0]?.url).toBe("https://cdn.hotelbeds/saulo/hero.jpg");
    expect(accommodation.amenities).toEqual(["Pool"]);
    expect(accommodation.contacts[0]?.email).toBe("bookings@saulo.example.com");
    expect(accommodation.providerReference.provider).toBe("hotelbeds");
    expect(accommodation.providerReference.providerAccommodationId).toBe("8629");
  });
});