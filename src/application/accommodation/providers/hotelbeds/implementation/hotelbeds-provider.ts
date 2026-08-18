import {
  AccommodationProviderCapability,
  AccommodationProviderCapabilityType,
  ProviderCapabilitySet,
} from "../../../capabilities";
import { Accommodation } from "../../../models";
import {
  AccommodationAvailabilityResult,
  AccommodationContentResult,
  AccommodationDetailsResult,
  AccommodationImageResult,
  AccommodationResultMetadata,
  AccommodationSearchResult,
} from "../../../results";
import {
  AccommodationRate,
  AccommodationRateResult,
  AccommodationRateStatus,
  AccommodationRateType,
} from "../../../rates";
import { AccommodationSearchCriteria } from "../../../discovery";

import { AccommodationProvider } from "../../accommodation-provider";
import { HotelMapper, HotelbedsAvailabilityResponseMapper } from "../mapper";
import {
  DefaultHotelbedsAvailabilityExecutor,
  DefaultHotelbedsClient,
  HotelbedsAvailabilityExecutionResult,
  HotelbedsAvailabilityExecutor,
  HotelbedsAvailabilityRequest,
  HotelbedsClient,
  HotelbedsRequest,
} from "../client";
import { HotelbedsHotel, HotelbedsRate } from "../models";

function parseAmount(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapRateType(_rate: HotelbedsRate): AccommodationRateType {
  return AccommodationRateType.PUBLIC;
}

function mapRateStatus(rate: HotelbedsRate): AccommodationRateStatus {
  if (typeof rate.allotment !== "number") {
    return AccommodationRateStatus.UNKNOWN;
  }

  if (rate.allotment <= 0) {
    return AccommodationRateStatus.UNAVAILABLE;
  }

  if (rate.allotment <= 3) {
    return AccommodationRateStatus.LIMITED;
  }

  return AccommodationRateStatus.AVAILABLE;
}

function mapRate(
  rate: HotelbedsRate,
  defaultCurrency: AccommodationRateResult["rates"][number]["currency"],
): AccommodationRate {
  return {
    id: rate.rateKey ?? "unknown-rate",
    type: mapRateType(rate),
    status: mapRateStatus(rate),
    currency: defaultCurrency,
    amount: parseAmount(rate.sellingRate ?? rate.net),
    boardCode: rate.boardCode,
    boardName: rate.boardName,
  };
}

export interface HotelbedsAccommodationMapper {
  mapHotel(hotel: HotelbedsHotel): Accommodation;
}

export interface HotelbedsAvailabilityMapper {
  mapAvailabilityResponse(rawResponses: ReadonlyArray<HotelbedsAvailabilityExecutionResult["responses"][number]>): AccommodationAvailabilityResult;
}

function createMetadata(): AccommodationResultMetadata {
  return {
    provider: "hotelbeds",
    generatedAt: new Date(),
    version: "1.0.0",
  };
}

function createCapability(
  type: AccommodationProviderCapabilityType,
  name: string,
  description: string,
): AccommodationProviderCapability {
  return {
    identifier: `hotelbeds.${type.toLowerCase()}.v1`,
    type,
    name,
    description,
    version: "1.0.0",
    enabled: true,
    deprecated: false,
    experimental: false,
    features: {
      features: [],
    },
  };
}

function createCapabilities(): ProviderCapabilitySet {
  return {
    capabilities: [
      createCapability(
        AccommodationProviderCapabilityType.SEARCH,
        "Hotel Search",
        "Searches Hotelbeds accommodation content via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.DETAILS,
        "Hotel Details",
        "Retrieves Hotelbeds accommodation details via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.AVAILABILITY,
        "Hotel Availability",
        "Executes Hotelbeds real-time accommodation availability requests.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.CONTENT,
        "Hotel Content",
        "Retrieves Hotelbeds content payloads via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.IMAGES,
        "Hotel Images",
        "Retrieves Hotelbeds image payloads via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.RATES,
        "Hotel Rates",
        "Retrieves Hotelbeds rate payloads via the provider client.",
      ),
    ],
  };
}

function createRequest(operation: HotelbedsRequest["operation"], path: string): HotelbedsRequest {
  return {
    operation,
    method: "GET",
    path,
  };
}

export class HotelbedsProvider implements AccommodationProvider {
  public readonly providerId = "hotelbeds";
  public readonly capabilities = createCapabilities();

  public constructor(
    private readonly client: HotelbedsClient = new DefaultHotelbedsClient(),
    private readonly mapper: HotelbedsAccommodationMapper = new HotelMapper(),
    private readonly availabilityExecutor: HotelbedsAvailabilityExecutor =
      new DefaultHotelbedsAvailabilityExecutor(),
    private readonly availabilityMapper: HotelbedsAvailabilityMapper =
      new HotelbedsAvailabilityResponseMapper(),
  ) {}

  public async search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult> {
    const response = await this.client.searchHotels({
      ...createRequest("search", "/hotels"),
      query: {
        destination: criteria.destination,
        checkInDate: criteria.checkInDate.toISOString(),
        checkOutDate: criteria.checkOutDate.toISOString(),
        adults: criteria.adults,
        children: criteria.children,
        rooms: criteria.rooms,
      },
    });

    return {
      accommodations: response.data.map((hotel) => this.mapper.mapHotel(hotel)),
      metadata: createMetadata(),
    };
  }

  public async details(providerAccommodationId: string): Promise<AccommodationDetailsResult> {
    const response = await this.client.getHotelDetails(
      createRequest("details", `/hotels/${providerAccommodationId}`),
    );

    return {
      accommodation: this.mapper.mapHotel(response.data),
      metadata: createMetadata(),
    };
  }

  public async content(providerAccommodationId: string): Promise<AccommodationContentResult> {
    const response = await this.client.getHotelContent(
      createRequest("content", `/hotels/${providerAccommodationId}/content`),
    );

    return {
      accommodation: this.mapper.mapHotel(response.data),
      metadata: createMetadata(),
    };
  }

  public async images(providerAccommodationId: string): Promise<AccommodationImageResult> {
    const detailsResult = await this.details(providerAccommodationId);

    return {
      accommodationId: detailsResult.accommodation.identity.id,
      images: detailsResult.accommodation.images,
      metadata: createMetadata(),
    };
  }

  public async rates(query: import("../../../rates").AccommodationRateQuery): Promise<AccommodationRateResult> {
    const response = await this.client.getHotelRates(
      createRequest("rates", `/hotels/${query.identifier}/rates`),
    );

    return {
      accommodationId: query.identifier,
      stayPeriod: query.stayPeriod,
      occupancy: query.occupancy,
      selectionStrategy: query.selectionStrategy,
      rates: response.data.map((rate) => mapRate(rate, query.context.currency)),
      metadata: createMetadata(),
    };
  }

  public async executeAvailabilityRequests(
    requests: ReadonlyArray<HotelbedsAvailabilityRequest>,
  ): Promise<HotelbedsAvailabilityExecutionResult> {
    return this.availabilityExecutor.execute(requests);
  }

  public mapAvailabilityResponse(
    rawResponses: ReadonlyArray<HotelbedsAvailabilityExecutionResult["responses"][number]>,
  ): AccommodationAvailabilityResult {
    return this.availabilityMapper.mapAvailabilityResponse(rawResponses);
  }
}