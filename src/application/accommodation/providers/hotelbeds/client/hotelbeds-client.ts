import { HotelbedsHotel, HotelbedsImage, HotelbedsRate } from "../models";
import {
  DefaultHotelbedsGateway,
  HotelbedsGateway,
} from "./hotelbeds-gateway";
import { HotelbedsIntegrationErrorCode } from "./hotelbeds-integration-error";
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
  status = 200,
): HotelbedsResponse<T> {
  return {
    request,
    status,
    data,
  };
}

function toClientError(request: HotelbedsRequest, code: string, message: string): Error {
  const error = new Error(`Hotelbeds ${request.operation} failed: ${message}`);
  (error as Error & { code?: string }).code = code;
  return error;
}

async function executeAndUnwrap<T>(
  gateway: HotelbedsGateway,
  request: HotelbedsRequest,
): Promise<HotelbedsResponse<T>> {
  const result = await gateway.execute<T>(request);

  if (!result.success || result.data === null) {
    const firstError = result.errors[0];
    const code = firstError?.code ?? HotelbedsIntegrationErrorCode.UNKNOWN_ERROR;
    const message = firstError?.message ?? "Unknown Hotelbeds provider failure.";
    throw toClientError(request, code, message);
  }

  return createResponse(request, result.data, result.providerResponse?.status ?? 200);
}

export class DefaultHotelbedsClient implements HotelbedsClient {
  public constructor(private readonly gateway: HotelbedsGateway = new DefaultHotelbedsGateway()) {}

  public async searchHotels(
    request: HotelbedsRequest,
  ): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>> {
    if (request.path.startsWith("/placeholder")) {
      return createResponse(request, [createPlaceholderHotel()]);
    }

    return executeAndUnwrap<ReadonlyArray<HotelbedsHotel>>(this.gateway, request);
  }

  public async getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>> {
    if (request.path.startsWith("/placeholder")) {
      return createResponse(request, createPlaceholderHotel());
    }

    return executeAndUnwrap<HotelbedsHotel>(this.gateway, request);
  }

  public async getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>> {
    if (request.path.startsWith("/placeholder")) {
      return createResponse(request, createPlaceholderHotel());
    }

    return executeAndUnwrap<HotelbedsHotel>(this.gateway, request);
  }

  public async getHotelImages(
    request: HotelbedsRequest,
  ): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>> {
    if (request.path.startsWith("/placeholder")) {
      return createResponse(request, createPlaceholderHotel().images ?? []);
    }

    return executeAndUnwrap<ReadonlyArray<HotelbedsImage>>(this.gateway, request);
  }

  public async getHotelRates(
    request: HotelbedsRequest,
  ): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>> {
    if (request.path.startsWith("/placeholder")) {
      return createResponse(request, createPlaceholderHotel().rooms?.[0]?.rates ?? []);
    }

    return executeAndUnwrap<ReadonlyArray<HotelbedsRate>>(this.gateway, request);
  }
}