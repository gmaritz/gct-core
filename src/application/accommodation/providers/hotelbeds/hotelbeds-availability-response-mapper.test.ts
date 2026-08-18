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
      hotels: { codes: [123] },
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

    expect(result.accommodation.identity.id).toBe("123");
    expect(result.accommodation.providerReference.providerAccommodationId).toBe("123");
    expect(result.available).toBe(true);
    expect(result.metadata.provider).toBe("hotelbeds");
    expect(Object.keys(result)).toEqual(["accommodation", "available", "metadata"]);
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

    expect(result.available).toBe(false);
    expect(result.accommodation.identity.id).toBe("456");
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

    expect(result.available).toBe(true);
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
