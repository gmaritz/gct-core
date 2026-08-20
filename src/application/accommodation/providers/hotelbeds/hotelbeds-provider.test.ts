import {
  AccommodationCurrency,
  AccommodationRateSelectionStrategy,
  AccommodationRateSource,
  Accommodation,
  AccommodationProviderCapabilityType,
  AccommodationRateResult,
  AccommodationSearchCriteria,
  AccommodationSearchResult,
  HotelbedsAvailabilityExecutionResult,
  HotelbedsAvailabilityExecutor,
  HotelbedsAvailabilityRequest,
  HotelbedsClient,
  HotelbedsHotel,
  HotelbedsProvider,
  HotelbedsRequest,
  HotelbedsResponse,
} from "@application/accommodation";

function createCriteria(): AccommodationSearchCriteria {
  return {
    destination: "Cape Town",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    adults: 2,
    children: 1,
    rooms: 1,
  };
}

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
      AccommodationProviderCapabilityType.AVAILABILITY,
      AccommodationProviderCapabilityType.CONTENT,
      AccommodationProviderCapabilityType.IMAGES,
      AccommodationProviderCapabilityType.RATES,
      AccommodationProviderCapabilityType.REVALIDATION,
      AccommodationProviderCapabilityType.BOOKING,
      AccommodationProviderCapabilityType.CANCELLATION,
      AccommodationProviderCapabilityType.MODIFICATION,
      AccommodationProviderCapabilityType.BOOKING_DETAILS,
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
        return createResponse(request, [
          {
            rateKey: "hb-rate-888",
            rateClass: "NOR",
            rateType: "BOOKABLE",
            net: "300.00",
            sellingRate: "330.00",
            boardCode: "RO",
            boardName: "ROOM ONLY",
            allotment: 4,
          },
        ]);
      },
    };
    const provider = new HotelbedsProvider(client);

    const criteria = createCriteria();
    const result: AccommodationSearchResult = await provider.search(criteria);

    expect(searchRequests).toHaveLength(1);
    expect(searchRequests[0]?.operation).toBe("search");
    expect(searchRequests[0]?.query).toEqual({
      destination: criteria.destination,
      checkInDate: criteria.checkInDate.toISOString(),
      checkOutDate: criteria.checkOutDate.toISOString(),
      adults: criteria.adults,
      children: criteria.children,
      rooms: criteria.rooms,
    });
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
        return createResponse(request, [
          {
            rateKey: "hb-rate-888",
            rateClass: "NOR",
            rateType: "BOOKABLE",
            net: "300.00",
            sellingRate: "330.00",
            boardCode: "RO",
            boardName: "ROOM ONLY",
            allotment: 4,
          },
        ]);
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

    const result = await provider.search(createCriteria());

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
        return createResponse(request, [
          {
            rateKey: "hb-rate-888",
            rateClass: "NOR",
            rateType: "BOOKABLE",
            net: "300.00",
            sellingRate: "330.00",
            boardCode: "RO",
            boardName: "ROOM ONLY",
            allotment: 4,
          },
        ]);
      },
    };
    const provider = new HotelbedsProvider(client);

    const details = await provider.details("888");
    const content = await provider.content("888");
    const images = await provider.images("888");
    const rates: AccommodationRateResult = await provider.rates({
      identifier: "888",
      stayPeriod: {
        checkIn: new Date("2026-09-10T00:00:00.000Z"),
        checkOut: new Date("2026-09-14T00:00:00.000Z"),
      },
      occupancy: {
        adults: 2,
        children: 0,
        rooms: 1,
      },
      selectionStrategy: AccommodationRateSelectionStrategy.CHEAPEST,
      context: {
        requestId: "req-rates-888",
        source: AccommodationRateSource.API,
        currency: AccommodationCurrency.EUR,
        market: "ZA",
        timestamp: new Date("2026-08-05T00:00:00.000Z"),
      },
    });

    expect(details.accommodation.identity.id).toBe("888");
    expect(content.accommodation.identity.name).toBe("Table Mountain Lodge");
    expect(images.accommodationId).toBe("888");
    expect(images.images).toHaveLength(1);
    expect(rates.accommodationId).toBe("888");
    expect(rates.rates[0]?.currency).toBe(AccommodationCurrency.EUR);
  });

  it("provides explicit R3 to R4 availability entrypoint without invoking legacy GET search", async () => {
    const searchHotels = jest.fn();
    const client: HotelbedsClient = {
      async searchHotels(request) {
        searchHotels(request);
        return createResponse(request, []);
      },
      async getHotelDetails(request) {
        return createResponse(request, createHotel(1, "unused"));
      },
      async getHotelContent(request) {
        return createResponse(request, createHotel(1, "unused"));
      },
      async getHotelImages(request) {
        return createResponse(request, []);
      },
      async getHotelRates(request) {
        return createResponse(request, []);
      },
    };

    const capturedRequests: HotelbedsAvailabilityRequest[][] = [];
    const availabilityExecutor: HotelbedsAvailabilityExecutor = {
      async execute(requests): Promise<HotelbedsAvailabilityExecutionResult> {
        capturedRequests.push([...requests]);
        return {
          provider: "hotelbeds",
          operation: "availability",
          completedAt: new Date("2026-08-18T00:00:00.000Z"),
          responses: [],
        };
      },
    };

    const provider = new HotelbedsProvider(client, undefined, availabilityExecutor);
    const requests: ReadonlyArray<HotelbedsAvailabilityRequest> = [
      {
        operation: "availability",
        method: "POST",
        path: "/hotel-api/1.0/hotels",
        body: {
          stay: {
            checkIn: "2026-09-10",
            checkOut: "2026-09-14",
          },
          sourceMarket: "ZA",
          occupancies: [
            {
              rooms: 1,
              adults: 2,
              children: 0,
              paxes: [{ type: "AD" }, { type: "AD" }],
            },
          ],
          hotels: {
            hotel: [1001],
          },
        },
      },
    ];

    const result = await provider.executeAvailabilityRequests(requests);

    expect(searchHotels).not.toHaveBeenCalled();
    expect(capturedRequests).toEqual([[requests[0]]]);
    expect(result.operation).toBe("availability");
  });

  it("compiles provider exports through the accommodation namespace", () => {
    const provider = new HotelbedsProvider();

    expect(provider.capabilities.capabilities.some((capability) => capability.type === AccommodationProviderCapabilityType.SEARCH)).toBe(true);
  });
});