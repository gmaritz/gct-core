import {
  AccommodationQueryValidator,
  AccommodationSearchContext,
  AccommodationSearchCriteria,
  AccommodationSearchQuery,
  AccommodationSearchSource,
  AccommodationValidationErrorCode,
} from "@application/accommodation";

function createCriteria(): AccommodationSearchCriteria {
  return {
    destination: "Cape Town",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    adults: 2,
    children: 1,
    rooms: 1,
    category: "Villa",
    minimumRating: 4,
    amenities: ["Pool"],
    collections: ["Family"],
  };
}

function createContext(): AccommodationSearchContext {
  return {
    requestId: "req-validator-001",
    source: AccommodationSearchSource.INTERNAL,
    channel: "application",
    locale: "en-ZA",
    currency: "ZAR",
    timestamp: new Date("2026-08-05T00:00:00.000Z"),
  };
}

function createQuery(
  criteriaOverrides: Partial<AccommodationSearchCriteria> = {},
  contextOverrides: Partial<AccommodationSearchContext> = {},
): AccommodationSearchQuery {
  return {
    criteria: {
      ...createCriteria(),
      ...criteriaOverrides,
    },
    context: {
      ...createContext(),
      ...contextOverrides,
    },
  };
}

describe("AccommodationQueryValidator", () => {
  it("returns a frozen valid result for a canonical query", () => {
    const validator = new AccommodationQueryValidator();

    const result = validator.validate(createQuery());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
  });

  it.each([
    ["missing destination", { destination: "   " }, {}, AccommodationValidationErrorCode.MISSING_DESTINATION],
    [
      "missing check-in",
      { checkInDate: undefined as unknown as Date },
      {},
      AccommodationValidationErrorCode.MISSING_CHECK_IN,
    ],
    [
      "missing check-out",
      { checkOutDate: undefined as unknown as Date },
      {},
      AccommodationValidationErrorCode.MISSING_CHECK_OUT,
    ],
    [
      "invalid date range",
      { checkOutDate: new Date("2026-09-09T00:00:00.000Z") },
      {},
      AccommodationValidationErrorCode.INVALID_DATE_RANGE,
    ],
    ["invalid adult count", { adults: 0 }, {}, AccommodationValidationErrorCode.INVALID_ADULT_COUNT],
    [
      "invalid child count",
      { children: -1 },
      {},
      AccommodationValidationErrorCode.INVALID_CHILD_COUNT,
    ],
    ["invalid room count", { rooms: 0 }, {}, AccommodationValidationErrorCode.INVALID_ROOM_COUNT],
    [
      "missing requestId",
      {},
      { requestId: "   " },
      AccommodationValidationErrorCode.MISSING_REQUEST_ID,
    ],
    [
      "missing source",
      {},
      { source: "" as AccommodationSearchSource },
      AccommodationValidationErrorCode.MISSING_SOURCE,
    ],
    [
      "missing timestamp",
      {},
      { timestamp: undefined as unknown as Date },
      AccommodationValidationErrorCode.MISSING_TIMESTAMP,
    ],
  ])("returns %s", (_label, criteriaOverrides, contextOverrides, expectedCode) => {
    const validator = new AccommodationQueryValidator();

    const result = validator.validate(createQuery(criteriaOverrides, contextOverrides));

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe(expectedCode);
  });

  it("returns all validation codes in a single response when multiple inputs are invalid", () => {
    const validator = new AccommodationQueryValidator();

    const result = validator.validate(
      createQuery(
        {
          destination: "",
          adults: 0,
          rooms: 0,
        },
        {
          requestId: "",
          source: "" as AccommodationSearchSource,
          timestamp: undefined as unknown as Date,
        },
      ),
    );

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual([
      AccommodationValidationErrorCode.MISSING_DESTINATION,
      AccommodationValidationErrorCode.INVALID_ADULT_COUNT,
      AccommodationValidationErrorCode.INVALID_ROOM_COUNT,
      AccommodationValidationErrorCode.MISSING_REQUEST_ID,
      AccommodationValidationErrorCode.MISSING_SOURCE,
      AccommodationValidationErrorCode.MISSING_TIMESTAMP,
    ]);
  });

  it.each([
    ["123abc"],
    ["abc123"],
    ["12abc34"],
    ["123.45"],
    [""],
    ["   "],
    ["-1"],
    ["1.5"],
    ["9007199254740992"],
  ])("returns invalid hotel code for malformed explicit code %p", (hotelCode) => {
    const validator = new AccommodationQueryValidator();

    const result = validator.validate(createQuery({ hotelCodes: [hotelCode] }));

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe(AccommodationValidationErrorCode.INVALID_HOTEL_CODE);
    expect(result.errors[0]?.field).toBe("criteria.hotelCodes[0]");
  });
});