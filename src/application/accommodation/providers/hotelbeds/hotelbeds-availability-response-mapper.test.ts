import {
  HotelbedsAvailabilityRawResponse,
  HotelbedsAvailabilityResponseMapper,
  HotelbedsIntegrationErrorCode,
} from "@application/accommodation";

function createRequest() {
  return {
    operation: "availability" as const,
    method: "POST" as const,
    path: "/hotel-api/1.0/hotels" as const,
    body: {
      stay: { checkIn: "2026-09-10", checkOut: "2026-09-14" },
      occupancies: [{ rooms: 1 as const, adults: 2, children: 0, paxes: [{ type: "AD" as const }] }],
      hotels: { hotel: [123] },
      sourceMarket: "US",
    },
    correlationId: "corr-1",
    requestId: "req-1",
  };
}

function createRawResponse(
  overrides: Partial<HotelbedsAvailabilityRawResponse> = {},
): HotelbedsAvailabilityRawResponse {
  return {
    requestIndex: 0,
    request: createRequest(),
    success: true,
    retryable: false,
    attempts: 1,
    errors: [],
    ...overrides,
  };
}

describe("Hotelbeds availability response mapper", () => {
  it("maps the verified nested Hotelbeds hotels envelope and preserves hotel ordering", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();
    const result = mapper.mapAvailabilityResponse([
      createRawResponse({
        body: {
          hotels: {
            hotels: [
              {
                code: 26996,
                name: "Cape Milner",
                rooms: [{
                  code: "DBL.LX",
                  rates: [{
                    rateKey: "controlled-rate",
                    rateType: "BOOKABLE",
                    allotment: 7,
                    net: "863.49",
                    boardCode: "BB",
                    boardName: "BED AND BREAKFAST",
                  }],
                }],
              },
              { code: 26999, name: "Garden Court Victoria Junction", rooms: [] },
            ],
            checkIn: "2026-09-15",
            checkOut: "2026-09-18",
            total: 2,
          },
        },
      }),
    ]);

    expect(result.kind).toBe("ACCOMMODATION");
    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    if (result.result.kind !== "ACCOMMODATION") throw new Error("Expected mapped accommodation result.");
    expect(result.result.available).toBe(true);
    expect(result.result.accommodation!.identity.id).toBe("26996");
    expect(result.results).toHaveLength(2);
    const firstResult = result.results[0];
    if (!firstResult || firstResult.kind !== "ACCOMMODATION") throw new Error("Expected mapped accommodation result.");
    expect(firstResult.availabilityOptions?.roomOptions).toHaveLength(1);
    expect(firstResult.availabilityOptions?.roomOptions[0]?.rateOptions).toHaveLength(1);
    expect(firstResult.availabilityOptions?.roomOptions[0]?.rateOptions[0]?.status).toBe("BOOKABLE");
  });

  it("maps the verified zero-result envelope without fabricating an accommodation", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();

    const result = mapper.mapAvailabilityResponse([
      createRawResponse({ body: { hotels: { total: 0 } } }),
    ]);

    expect(result).toEqual({ kind: "NO_AVAILABILITY" });
  });

  it("rejects a nested response with an empty hotel collection without total zero", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();

    expect(() => mapper.mapAvailabilityResponse([
      createRawResponse({ body: { hotels: { hotels: [] } } }),
    ])).toThrow("no supplier hotel entries");
  });

  it("maps a valid successful Hotelbeds response to the canonical availability result", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();
    const result = mapper.mapAvailabilityResponse([
      createRawResponse({
        body: {
          hotels: [
            {
              code: 123,
              name: "Cape View Hotel",
              rooms: [
                {
                  code: "DBL.ST",
                  rates: [{ rateType: "BOOKABLE", allotment: 4, sellingRate: "330.00" }],
                },
              ],
            },
          ],
        },
      }),
    ]);

    expect(result.kind).toBe("ACCOMMODATION");
    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    if (result.result.kind !== "ACCOMMODATION") throw new Error("Expected mapped accommodation result.");
    expect(result.result.accommodation!.identity.id).toBe("123");
    expect(result.result.accommodation!.providerReference.providerAccommodationId).toBe("123");
    expect(result.result.available).toBe(true);
    expect(result.result.metadata.provider).toBe("hotelbeds");
    expect(Object.keys(result.result)).toEqual([
      "kind",
      "accommodation",
      "available",
      "requestedOccupancy",
      "availabilityOptions",
      "metadata",
    ]);
  });

  it("maps a valid successful response with no qualifying availability to unavailable", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();
    const result = mapper.mapAvailabilityResponse([
      createRawResponse({
        body: {
          hotels: [
            {
              code: 456,
              name: "Closed Hotel",
              rooms: [
                {
                  code: "DBL.ST",
                  rates: [{ rateType: "BOOKABLE", allotment: 0, sellingRate: "0.00" }],
                },
              ],
            },
          ],
        },
      }),
    ]);

    expect(result.kind).toBe("ACCOMMODATION");
    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    expect(result.result.available).toBe(false);
    expect(result.result.accommodation!.identity.id).toBe("456");
  });

  it("aggregates multi-batch responses and resolves to available when any batch qualifies", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();
    const result = mapper.mapAvailabilityResponse([
      createRawResponse({
        requestIndex: 0,
        body: {
          hotels: [
            {
              code: 100,
              name: "Batch A",
              rooms: [{ code: "DBL.ST", rates: [{ rateType: "BOOKABLE", allotment: 0 }] }],
            },
          ],
        },
      }),
      createRawResponse({
        requestIndex: 1,
        body: {
          hotels: [
            {
              code: 200,
              name: "Batch B",
              rooms: [{ code: "DBL.ST", rates: [{ rateType: "BOOKABLE", allotment: 2 }] }],
            },
          ],
        },
      }),
    ]);

    expect(result.kind).toBe("ACCOMMODATION");
    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    expect(result.result.available).toBe(true);
  });

  it("preserves RECHECK status and offered child occupancy", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();
    const result = mapper.mapAvailabilityResponse([
      createRawResponse({
        body: {
          hotels: [{
            code: 321,
            name: "Occupancy Hotel",
            currency: "ZAR",
            rooms: [{
              code: "FAM",
              name: "Family Room",
              rates: [{
                rateKey: "opaque-rate",
                rateType: "RECHECK",
                rooms: 1,
                adults: 2,
                children: 1,
                childrenAges: "7",
                net: "100.00",
              }],
            }],
          }],
        },
      }),
    ]);

    expect(result.kind).toBe("ACCOMMODATION");
    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    if (result.result.kind !== "ACCOMMODATION") throw new Error("Expected mapped accommodation result.");
    const rate = result.result.availabilityOptions?.roomOptions[0]?.rateOptions[0];
    expect(rate?.status).toBe("RECHECK_REQUIRED");
    expect(rate?.reference).toEqual({ provider: "hotelbeds", opaqueReference: "opaque-rate" });
    expect(rate?.pricing).toEqual({ amount: 100, currency: "ZAR", basis: "TOTAL_STAY" });
    expect(rate?.occupancy.rooms[0]).toEqual({ adults: 2, children: 1, childAges: [7] });
  });

  it("preserves supplier, HTTP, and transport failures as failures instead of false availability", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();

    expect(() =>
      mapper.mapAvailabilityResponse([
        createRawResponse({
          success: false,
          supplierError: { code: "HB-500", message: "supplier issue", payload: { code: "HB-500" } },
          errors: [{ code: HotelbedsIntegrationErrorCode.PROVIDER_ERROR, message: "supplier issue", retryable: false }],
        }),
      ]),
    ).toThrow(/supplier|failure/i);

    expect(() =>
      mapper.mapAvailabilityResponse([
        createRawResponse({
          success: false,
          httpStatus: 503,
          errors: [{ code: HotelbedsIntegrationErrorCode.PROVIDER_ERROR, message: "provider error", retryable: true }],
        }),
      ]),
    ).toThrow(/http|failure/i);

    expect(() =>
      mapper.mapAvailabilityResponse([
        createRawResponse({
          success: false,
          transportFailure: { kind: "TIMEOUT", message: "timeout" },
          errors: [{ code: HotelbedsIntegrationErrorCode.TIMEOUT, message: "timeout", retryable: true }],
        }),
      ]),
    ).toThrow(/transport|failure/i);
  });

  it("throws on malformed supplier payloads instead of silently converting them to unavailable", () => {
    const mapper = new HotelbedsAvailabilityResponseMapper();

    expect(() =>
      mapper.mapAvailabilityResponse([
        createRawResponse({
          success: true,
          body: { unexpected: "format" },
          errors: [],
        }),
      ]),
    ).toThrow(/malformed|invalid|response/i);
  });
});
