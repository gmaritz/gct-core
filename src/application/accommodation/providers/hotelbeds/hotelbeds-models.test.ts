import {
  HotelbedsAddress,
  HotelbedsApiResponse,
  HotelbedsDestination,
  HotelbedsFacility,
  HotelbedsHotel,
  HotelbedsImage,
  HotelbedsLocation,
  HotelbedsRate,
  HotelbedsRoom,
} from "@application/accommodation";

describe("Hotelbeds provider models", () => {
  it("constructs supplier-faithful Hotelbeds accommodation structures", () => {
    const address: HotelbedsAddress = {
      content: "Avenida Diagonal 589",
      postalCode: "08014",
      city: "Barcelona",
      countryCode: "ES",
    };

    const location: HotelbedsLocation = {
      latitude: "41.390205",
      longitude: "2.154007",
      destinationCode: "BCN",
      destinationName: "Barcelona",
      zoneCode: 10,
      zoneName: "Eixample",
      groupZones: [
        {
          groupZoneCode: 1,
          groupZoneName: "Barcelona Urban Area",
        },
      ],
    };

    const image: HotelbedsImage = {
      path: "http://photos.hotelbeds.com/giata/01/010001/010001a_hb_ro_001.jpg",
      imageTypeCode: "GEN",
      order: 1,
      visualOrder: 1,
    };

    const facility: HotelbedsFacility = {
      facilityCode: 10,
      facilityName: "Wi-fi",
      facilityGroupCode: 60,
      facilityGroupName: "Internet",
      indYesOrNo: true,
      indFee: false,
    };

    const rate: HotelbedsRate = {
      rateKey:
        "20240615|20240616|W|102|123223|DBL.ST|GAR-TODOSBB|RO||1~2~0||P@06~~24b14a~-981738712~N~~~NOR",
      rateClass: "NOR",
      rateType: "BOOKABLE",
      net: "294.37",
      sellingRate: "330.75",
      boardCode: "RO",
      boardName: "ROOM ONLY",
      paymentType: "AT_WEB",
      cancellationPolicies: [
        {
          amount: "330.75",
          from: "2024-06-15T12:00:00+02:00",
        },
      ],
      taxes: {
        allIncluded: true,
        taxScheme: "general",
        taxes: [
          {
            included: false,
            amount: "6.60",
            currency: "EUR",
            type: "FEE",
            subType: "Resort Fee",
          },
        ],
      },
      offers: [
        {
          code: "9005",
          name: "Exclusive discount",
          amount: "-36.75",
        },
      ],
      adults: 2,
      children: 0,
      rooms: 1,
    };

    const room: HotelbedsRoom = {
      code: "DBL.ST",
      name: "DOUBLE STANDARD",
      PMSRoomCode: "DBL.ST",
      rates: [rate],
      facilities: [facility],
    };

    const destination: HotelbedsDestination = {
      code: "BCN",
      name: "Barcelona",
      countryCode: "ES",
      groupZones: [
        {
          groupZoneCode: 1,
          groupZoneName: "Barcelona Urban Area",
        },
      ],
    };

    const hotel: HotelbedsHotel = {
      code: 123223,
      name: "Axor Feria",
      S2C: "1",
      categoryCode: "4EST",
      categoryName: "4 STARS",
      destinationCode: "MAD",
      destinationName: "Madrid",
      zoneCode: 35,
      zoneName: "Barajas-Ifema",
      accommodationTypeCode: "H",
      minRate: "294.37",
      maxRate: "294.37",
      currency: "EUR",
      address,
      location,
      destination,
      images: [image],
      facilities: [facility],
      rooms: [room],
    };

    expect(hotel.S2C).toBe("1");
    expect(hotel.accommodationTypeCode).toBe("H");
    expect(hotel.rooms?.[0]?.PMSRoomCode).toBe("DBL.ST");
    expect(hotel.location?.groupZones?.[0]?.groupZoneCode).toBe(1);
    expect(hotel.rooms?.[0]?.rates?.[0]?.rateType).toBe("BOOKABLE");
  });

  it("supports generic Hotelbeds API response wrapping", () => {
    const payload: ReadonlyArray<HotelbedsHotel> = [
      {
        code: 716,
        name: "Alua Gran Camp de Mar",
      },
    ];

    const response: HotelbedsApiResponse<ReadonlyArray<HotelbedsHotel>> = {
      auditData: {
        processTime: "158",
        token: "c6ce466d-82fe-4fac-8f21-536485be4da3",
      },
      payload,
    };

    expect(response.auditData.processTime).toBe("158");
    expect(response.payload?.[0]?.code).toBe(716);
  });

  it("compiles hotelbeds namespace exports through accommodation barrel", () => {
    const destination: HotelbedsDestination = {
      code: "PMI",
      name: "Majorca",
    };

    expect(destination.code).toBe("PMI");
  });
});