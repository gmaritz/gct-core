import {
  AccommodationProviderCapability,
  AccommodationProviderCapabilityType,
  ProviderCapabilitySet,
} from "../../../capabilities";
import { Accommodation } from "../../../models";
import {
  AccommodationContentResult,
  AccommodationDetailsResult,
  AccommodationImageResult,
  AccommodationResultMetadata,
  AccommodationSearchResult,
} from "../../../results";
import { AccommodationSearchCriteria } from "../../../discovery";

import { AccommodationProvider } from "../../accommodation-provider";
import { HotelMapper } from "../mapper";
import { DefaultHotelbedsClient, HotelbedsClient, HotelbedsRequest } from "../client";
import { HotelbedsHotel } from "../models";

export interface HotelbedsAccommodationMapper {
  mapHotel(hotel: HotelbedsHotel): Accommodation;
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
}