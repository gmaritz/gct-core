import { HotelbedsHotel, HotelbedsImage, HotelbedsRate } from "../models";
import {
  DefaultHotelbedsAuthentication,
  HotelbedsAuthentication,
} from "./hotelbeds-authentication";
import { HotelbedsRequest } from "./hotelbeds-request";
import { HotelbedsResponse } from "./hotelbeds-response";

export interface HotelbedsClient {
  searchHotels(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>>;
  getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
  getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
  getHotelImages(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>>;
  getHotelRates(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>>;
}

function createPlaceholderHotel(): HotelbedsHotel {
  return {
    code: 1000,
    name: "Hotelbeds Placeholder Hotel",
    categoryCode: "4EST",
    categoryName: "4 STARS",
    destinationCode: "CPT",
    destinationName: "Cape Town",
    zoneName: "Placeholder Zone",
    latitude: "-33.9249",
    longitude: "18.4241",
    address: {
      email: "placeholder@hotelbeds.local",
      phones: ["+27-21-000-0000"],
      countryCode: "ZA",
      city: "Cape Town",
    },
    facilities: [
      {
        facilityName: "Wi-Fi",
      },
    ],
    images: [
      {
        path: "https://cdn.gct.local/hotelbeds/placeholder/hero.jpg",
        order: 1,
        description: [{ content: "Hotelbeds placeholder image" }],
      },
    ],
    rooms: [
      {
        code: "DBL.ST",
        name: "DOUBLE STANDARD",
        rates: [
          {
            rateKey: "placeholder-rate-key",
            rateClass: "NOR",
            rateType: "BOOKABLE",
            net: "100.00",
            boardCode: "RO",
            boardName: "ROOM ONLY",
          },
        ],
      },
    ],
  };
}

function createResponse<T>(
  request: HotelbedsRequest,
  data: T,
  authentication: HotelbedsAuthentication,
): HotelbedsResponse<T> {
  return {
    request,
    status: 200,
    data,
    headers: authentication.prepareHeaders(request),
  };
}

export class DefaultHotelbedsClient implements HotelbedsClient {
  public constructor(
    private readonly authentication: HotelbedsAuthentication = new DefaultHotelbedsAuthentication(),
  ) {}

  public async searchHotels(
    request: HotelbedsRequest,
  ): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>> {
    return createResponse(request, [createPlaceholderHotel()], this.authentication);
  }

  public async getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>> {
    return createResponse(request, createPlaceholderHotel(), this.authentication);
  }

  public async getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>> {
    return createResponse(request, createPlaceholderHotel(), this.authentication);
  }

  public async getHotelImages(
    request: HotelbedsRequest,
  ): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>> {
    return createResponse(request, createPlaceholderHotel().images ?? [], this.authentication);
  }

  public async getHotelRates(
    request: HotelbedsRequest,
  ): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>> {
    return createResponse(request, createPlaceholderHotel().rooms?.[0]?.rates ?? [], this.authentication);
  }
}