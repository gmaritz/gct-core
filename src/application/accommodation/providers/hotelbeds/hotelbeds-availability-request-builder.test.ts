import {
  AccommodationOccupancyGroup,
  AccommodationSearchCriteria,
  HotelbedsAvailabilityRequestBuilder,
  ResolvedHotelCandidate,
} from "@application/accommodation";

function createCriteria(overrides: Partial<AccommodationSearchCriteria> = {}): AccommodationSearchCriteria {
  return {
    destination: "Cape Town",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    sourceMarket: "ZA",
    adults: 2,
    children: 0,
    rooms: 1,
    ...overrides,
  };
}

function createCandidates(codes: ReadonlyArray<string>): ReadonlyArray<ResolvedHotelCandidate> {
  return Object.freeze(codes.map((hotelCode) => Object.freeze({ hotelCode })));
}

function createOccupancies(groups: ReadonlyArray<AccommodationOccupancyGroup>): ReadonlyArray<AccommodationOccupancyGroup> {
  return Object.freeze(groups.map((group) => Object.freeze({ ...group, childAges: Object.freeze([...group.childAges]) })));
}

describe("HotelbedsAvailabilityRequestBuilder", () => {
  it("constructs one deterministic request for one candidate", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    const requests = builder.build(
      createCriteria({
        occupancies: createOccupancies([
          { adults: 2, children: 1, childAges: [7] },
        ]),
      }),
      createCandidates(["1001"]),
    );

    expect(requests).toHaveLength(1);
    expect(requests[0]).toEqual({
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
            children: 1,
            paxes: [
              { type: "AD" },
              { type: "AD" },
              { type: "CH", age: 7 },
            ],
          },
        ],
        hotels: {
          codes: [1001],
        },
      },
    });
  });

  it("maps multiple occupancy groups and keeps child ages with their room", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();
    const requests = builder.build(
      createCriteria({
        occupancies: createOccupancies([
          { adults: 2, children: 1, childAges: [7] },
          { adults: 1, children: 2, childAges: [4, 11] },
        ]),
        adults: 99,
        children: 99,
        rooms: 99,
      }),
      createCandidates(["1001", "1002"]),
    );

    expect(requests).toHaveLength(1);
    expect(requests[0]?.body.occupancies).toHaveLength(2);
    expect(requests[0]?.body.occupancies[0]?.children).toBe(1);
    expect(requests[0]?.body.occupancies[0]?.paxes.filter((pax) => pax.type === "CH").map((pax) => pax.age)).toEqual([7]);
    expect(requests[0]?.body.occupancies[1]?.children).toBe(2);
    expect(requests[0]?.body.occupancies[1]?.paxes.filter((pax) => pax.type === "CH").map((pax) => pax.age)).toEqual([4, 11]);
  });

  it("uses candidate codes only and preserves candidate order", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    const requests = builder.build(
      createCriteria({
        hotelCodes: ["9999", "8888"],
      }),
      createCandidates(["1003", "1001", "1002"]),
    );

    expect(requests).toHaveLength(1);
    expect(requests[0]?.body.hotels.codes).toEqual([1003, 1001, 1002]);
  });

  it("returns no requests when candidate set is empty", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();
    const requests = builder.build(createCriteria(), Object.freeze([]));

    expect(requests).toEqual([]);
  });

  it("batches 2000 and 2001 candidates deterministically", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();
    const candidateCodes = Array.from({ length: 2001 }, (_value, index) => String(index + 1));

    const requests = builder.build(createCriteria(), createCandidates(candidateCodes));

    expect(requests).toHaveLength(2);
    expect(requests[0]?.body.hotels.codes).toHaveLength(2000);
    expect(requests[1]?.body.hotels.codes).toHaveLength(1);
    expect(requests[0]?.body.hotels.codes[0]).toBe(1);
    expect(requests[0]?.body.hotels.codes[1999]).toBe(2000);
    expect(requests[1]?.body.hotels.codes[0]).toBe(2001);
  });

  it("rejects invalid source market", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    expect(() => builder.build(createCriteria({ sourceMarket: "   " }), createCandidates(["1001"]))).toThrow(
      "Invalid source market.",
    );
  });

  it("rejects invalid date ranges", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    expect(() =>
      builder.build(
        createCriteria({
          checkOutDate: new Date("2026-09-10T00:00:00.000Z"),
        }),
        createCandidates(["1001"]),
      ),
    ).toThrow("Invalid check-in/check-out range.");
  });

  it("rejects legacy occupancy with children because child ages are unavailable", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    expect(() =>
      builder.build(
        createCriteria({
          occupancies: undefined,
          adults: 2,
          children: 1,
          rooms: 1,
        }),
        createCandidates(["1001"]),
      ),
    ).toThrow("Legacy occupancy cannot represent child ages when children is greater than 0.");
  });

  it("rejects mismatched child counts and child ages", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    expect(() =>
      builder.build(
        createCriteria({
          occupancies: createOccupancies([{ adults: 2, children: 2, childAges: [7] }]),
        }),
        createCandidates(["1001"]),
      ),
    ).toThrow("Invalid occupancies[0].childAges.");
  });

  it("rejects invalid candidate hotel codes", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    expect(() => builder.build(createCriteria(), createCandidates(["123abc"]))).toThrow(
      "Invalid candidate hotel code at index 0.",
    );
  });

  it("rejects duplicate candidate hotel codes", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();

    expect(() => builder.build(createCriteria(), createCandidates(["1001", "1001"]))).toThrow(
      "Duplicate candidate hotel code detected: 1001.",
    );
  });

  it("does not mutate criteria or candidate inputs", () => {
    const occupancies = createOccupancies([{ adults: 2, children: 1, childAges: [7] }]);
    const criteria = createCriteria({ occupancies });
    const candidates = createCandidates(["1001", "1002"]);

    const criteriaClone = JSON.parse(JSON.stringify(criteria)) as Record<string, unknown>;
    const candidateClone = JSON.parse(JSON.stringify(candidates)) as ReadonlyArray<Record<string, unknown>>;

    const builder = new HotelbedsAvailabilityRequestBuilder();
    const result = builder.build(criteria, candidates);

    expect(result).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(criteria))).toEqual(criteriaClone);
    expect(JSON.parse(JSON.stringify(candidates))).toEqual(candidateClone);
  });

  it("constructs DTOs only with no supplier invocation", () => {
    const builder = new HotelbedsAvailabilityRequestBuilder();
    const transportSpy = jest.fn();

    const result = builder.build(createCriteria(), createCandidates(["1001"]));

    expect(result).toHaveLength(1);
    expect(transportSpy).not.toHaveBeenCalled();
  });
});
