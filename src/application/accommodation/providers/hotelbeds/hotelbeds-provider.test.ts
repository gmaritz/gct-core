import {
  Accommodation,
  AccommodationProviderCapabilityType,
  AccommodationSearchResult,
  HotelbedsClient,
  HotelbedsHotel,
  HotelbedsProvider,
  HotelbedsRequest,
  HotelbedsResponse,
} from "@application/accommodation";

function createHotel(code: number, name: string): HotelbedsHotel {
  return {
    code,
    name,
    categoryCode: "4EST",
    categoryName: "4 STARS",
    destinationCode: "CPT",
    destinationName: "Cape Town",
    zoneName: "City Bowl",
    latitude: "-33.9249",
    longitude: "18.4241",
    images: [
      {
        path: `https://cdn.gct.local/${code}.jpg`,
        order: 1,
        description: [{ content: `${name} hero` }],
      },
    ],
  };
}

function createResponse<T>(request: HotelbedsRequest, data: T): HotelbedsResponse<T> {
  return {
    request,
    status: 200,
    data,
  };
}

describe("Hotelbeds provider implementation", () => {
  it("constructs provider with stable identity and capability advertisement", () => {
    const provider = new HotelbedsProvider();

    expect(provider.providerId).toBe("hotelbeds");
    expect(provider.capabilities.capabilities.map((capability) => capability.type)).toEqual([
      AccommodationProviderCapabilityType.SEARCH,
      AccommodationProviderCapabilityType.DETAILS,
      AccommodationProviderCapabilityType.CONTENT,
      AccommodationProviderCapabilityType.IMAGES,
      AccommodationProviderCapabilityType.RATES,
    ]);
  });

  it("delegates search to the client and returns a canonical search result", async () => {
    const searchRequests: HotelbedsRequest[] = [];
    const client: HotelbedsClient = {
      async searchHotels(request) {
        searchRequests.push(request);
        return createResponse(request, [createHotel(101, "Signal Hill House")]);
      },
      async getHotelDetails(request) {
        return createResponse(request, createHotel(101, "Signal Hill House"));
      },
      async getHotelContent(request) {
        return createResponse(request, createHotel(101, "Signal Hill House"));
      },
      async getHotelImages(request) {
        return createResponse(request, []);
      },
      async getHotelRates(request) {
        return createResponse(request, []);
      },
    };
    const provider = new HotelbedsProvider(client);

    const result: AccommodationSearchResult = await provider.search();

    expect(searchRequests).toHaveLength(1);
    expect(searchRequests[0]?.operation).toBe("search");
    expect(result.accommodations).toHaveLength(1);
    expect(result.accommodations[0]?.identity.id).toBe("101");
    expect(result.metadata.provider).toBe("hotelbeds");
  });

  it("invokes the mapper during provider orchestration", async () => {
    const mappedAccommodation: Accommodation = {
      identity: {
        id: "777",
        name: "Mapped Hotel",
      },
      category: "Villa",
      location: {
        country: "ZA",
        region: "WC",
        city: "Cape Town",
        suburb: "Camps Bay",
        latitude: -33.95,
        longitude: 18.38,
      },
      rating: {
        stars: 5,
        classification: "Luxury",
      },
      images: [],
      amenities: [],
      policies: [],
      contacts: [],
      providerReference: {
        provider: "hotelbeds",
        providerAccommodationId: "777",
      },
    };
    const client: HotelbedsClient = {
      async searchHotels(request) {
        return createResponse(request, [createHotel(777, "Raw Supplier Hotel")]);
      },
      async getHotelDetails(request) {
        return createResponse(request, createHotel(777, "Raw Supplier Hotel"));
      },
      async getHotelContent(request) {
        return createResponse(request, createHotel(777, "Raw Supplier Hotel"));
      },
      async getHotelImages(request) {
        return createResponse(request, []);
      },
      async getHotelRates(request) {
        return createResponse(request, []);
      },
    };
    const mapperCalls: ReadonlyArray<HotelbedsHotel> = [];
    const mapper = {
      mapHotel(hotel: HotelbedsHotel): Accommodation {
        (mapperCalls as HotelbedsHotel[]).push(hotel);
        return mappedAccommodation;
      },
    };
    const provider = new HotelbedsProvider(client, mapper);

    const result = await provider.search();

    expect(mapperCalls).toHaveLength(1);
    expect(mapperCalls[0]?.code).toBe(777);
    expect(result.accommodations[0]).toBe(mappedAccommodation);
  });

  it("creates details, content, and image results through deterministic scaffolds", async () => {
    const client: HotelbedsClient = {
      async searchHotels(request) {
        return createResponse(request, [createHotel(888, "Table Mountain Lodge")]);
      },
      async getHotelDetails(request) {
        return createResponse(request, createHotel(888, "Table Mountain Lodge"));
      },
      async getHotelContent(request) {
        return createResponse(request, createHotel(888, "Table Mountain Lodge"));
      },
      async getHotelImages(request) {
        return createResponse(request, []);
      },
      async getHotelRates(request) {
        return createResponse(request, []);
      },
    };
    const provider = new HotelbedsProvider(client);

    const details = await provider.details("888");
    const content = await provider.content("888");
    const images = await provider.images("888");

    expect(details.accommodation.identity.id).toBe("888");
    expect(content.accommodation.identity.name).toBe("Table Mountain Lodge");
    expect(images.accommodationId).toBe("888");
    expect(images.images).toHaveLength(1);
  });

  it("compiles provider exports through the accommodation namespace", () => {
    const provider = new HotelbedsProvider();

    expect(provider.capabilities.capabilities.some((capability) => capability.type === AccommodationProviderCapabilityType.SEARCH)).toBe(true);
  });
});