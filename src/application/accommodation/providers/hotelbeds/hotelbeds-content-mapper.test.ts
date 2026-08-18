import {
  HotelbedsContentMapper,
  HotelbedsHotel,
} from "@application/accommodation";

describe("HotelbedsContentMapper", () => {
  it("maps Hotelbeds static content into canonical hotel content record", () => {
    const mapper = new HotelbedsContentMapper();
    const mapped = mapper.mapHotel(
      {
        code: 1234,
        name: { content: "Sea Point Residence" },
        description: [{ content: "Ocean-facing boutique stay" }],
        categoryCode: "4EST",
        categoryName: "4 STARS",
        accommodationTypeCode: "HOTEL",
        accommodationTypeName: "Hotel",
        destinationCode: "CPT",
        destinationName: "Cape Town",
        latitude: "-33.9000",
        longitude: "18.4000",
        address: {
          address1: "1 Beach Road",
          city: "Cape Town",
          countryCode: "ZA",
          countryName: "South Africa",
          email: "stay@seapoint.example.com",
          phones: ["+27-21-100-0000"],
        },
        facilities: [
          {
            facilityCode: 10,
            facilityName: "Wi-Fi",
            facilityGroupCode: 60,
            facilityGroupName: "Internet",
          },
        ],
        images: [
          {
            path: "https://cdn.hotelbeds.example/1234/1.jpg",
            imageTypeCode: "GEN",
            order: 1,
            description: [{ content: "Front view" }],
            lastUpdate: "2026-08-09T00:00:00.000Z",
          },
        ],
      },
      new Date("2026-08-08T00:00:00.000Z"),
    );

    expect(mapped.provider).toBe("hotelbeds");
    expect(mapped.providerHotelCode).toBe("1234");
    expect(mapped.name).toBe("Sea Point Residence");
    expect(mapped.coordinates.latitude).toBe(-33.9);
    expect(mapped.address?.countryCode).toBe("ZA");
    expect(mapped.facilities[0]?.name).toBe("Wi-Fi");
    expect(mapped.images[0]?.url).toContain("1234/1.jpg");
    expect(mapped.lastUpdatedAt.toISOString()).toBe("2026-08-09T00:00:00.000Z");
  });

  it("uses fallback update time when provider update time is unavailable", () => {
    const mapper = new HotelbedsContentMapper();
    const fallback = new Date("2026-08-08T00:00:00.000Z");

    const mapped = mapper.mapHotel(
      {
        code: "HB-1000",
        name: { content: "Fallback Hotel" },
      },
      fallback,
    );

    expect(mapped.providerHotelCode).toBe("HB-1000");
    expect(mapped.lastUpdatedAt.toISOString()).toBe(fallback.toISOString());
  });

  it("fails mapping when provider hotel code is missing", () => {
    const mapper = new HotelbedsContentMapper();

    expect(() => mapper.mapHotel({ name: "No Code Hotel" } as HotelbedsHotel, new Date())).toThrow(
      "Hotelbeds content hotel code is required.",
    );
  });

  it("fails mapping when provider hotel name is missing", () => {
    const mapper = new HotelbedsContentMapper();

    expect(() => mapper.mapHotel({ code: 777 } as HotelbedsHotel, new Date())).toThrow(
      "Hotelbeds hotel 777 does not include a name.",
    );
  });
});
