import { ApplicationService } from "../../../application-service";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { HotelCatalogueService } from "../../catalogue";
import { AccommodationSearchCriteria, AccommodationSearchQuery } from "../../discovery";
import { ProviderRegistry } from "../../registry";
import { AccommodationAvailabilityResult } from "../../results";
import { HotelbedsAvailabilityRequest, HotelbedsAvailabilityRequestBuilder } from "../../providers/hotelbeds/client";

interface AvailabilityProvider {
  executeAvailabilityRequests(requests: ReadonlyArray<HotelbedsAvailabilityRequest>): Promise<{
    readonly provider: string;
    readonly operation: string;
    readonly completedAt: Date;
    readonly responses: ReadonlyArray<unknown>;
  }>;
  mapAvailabilityResponse(rawResponses: ReadonlyArray<unknown>):
    | { readonly kind: "ACCOMMODATION"; readonly result: AccommodationAvailabilityResult }
    | { readonly kind: "NO_AVAILABILITY" };
}

function hasAvailabilityExecution(provider: unknown): provider is AvailabilityProvider {
  return (
    typeof (provider as AvailabilityProvider | undefined)?.executeAvailabilityRequests === "function" &&
    typeof (provider as AvailabilityProvider | undefined)?.mapAvailabilityResponse === "function"
  );
}

function createUnavailableResult(provider: string): AccommodationAvailabilityResult {
  return Object.freeze({
    kind: "ACCOMMODATION",
    accommodation: Object.freeze({
      identity: Object.freeze({ id: "unavailable", name: "Unavailable" }),
      category: "Guest House",
      location: Object.freeze({
        country: "",
        region: "",
        city: "",
        suburb: "",
        latitude: 0,
        longitude: 0,
      }),
      rating: Object.freeze({ stars: 0, classification: "Unknown" }),
      images: Object.freeze([]),
      amenities: Object.freeze([]),
      policies: Object.freeze([]),
      contacts: Object.freeze([]),
      providerReference: Object.freeze({ provider, providerAccommodationId: "unavailable" }),
    }),
    available: false,
    metadata: Object.freeze({
      provider,
      generatedAt: new Date(),
      version: "1.0.0",
    }),
  });
}

function toCandidateSelection(criteria: AccommodationSearchCriteria): {
  readonly hotelCodes: ReadonlyArray<string>;
  readonly destinationCode?: string;
  readonly zoneCode?: string;
  readonly starGrading?: number;
} {
  return {
    hotelCodes: criteria.hotelCodes ?? [],
    destinationCode: criteria.destinationCode,
    zoneCode: criteria.zoneCode,
    starGrading: criteria.starGrading,
  };
}

export interface AccommodationAvailabilityService
  extends ApplicationService<AccommodationSearchQuery, AccommodationAvailabilityResult> {
  execute(query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult>;
}

export class DefaultAccommodationAvailabilityService implements AccommodationAvailabilityService {
  public constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly catalogueService: HotelCatalogueService = new HotelCatalogueService({
      findActive: async () => [],
      upsert: async () => undefined,
      deactivateMissing: async () => undefined,
    } as never),
    private readonly requestBuilder: HotelbedsAvailabilityRequestBuilder = new HotelbedsAvailabilityRequestBuilder(),
  ) {}

  public async execute(query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> {
    const { criteria } = query;

    const candidateSelection = await this.catalogueService.select(toCandidateSelection(criteria));

    if (candidateSelection.hotelCodes.length === 0) {
      const provider = this.providerRegistry.resolveAll()[0]?.providerId ?? "hotelbeds";
      return createUnavailableResult(provider);
    }

    const requests = this.requestBuilder.build(
      criteria,
      candidateSelection.hotelCodes.map((hotelCode) => ({ hotelCode })),
    );

    if (requests.length === 0) {
      const provider = this.providerRegistry.resolveAll()[0]?.providerId ?? "hotelbeds";
      return createUnavailableResult(provider);
    }

    const providers = this.providerRegistry.findProviders(AccommodationProviderCapabilityType.AVAILABILITY);
    const provider = providers[0] ?? this.providerRegistry.resolveAll().find(hasAvailabilityExecution);

    if (!provider || !hasAvailabilityExecution(provider)) {
      throw new Error("No accommodation availability provider is registered");
    }

    const executionResult = await provider.executeAvailabilityRequests(requests);
    const mappingResult = provider.mapAvailabilityResponse(executionResult.responses);
    if (mappingResult.kind === "NO_AVAILABILITY") {
      return Object.freeze({
        kind: "NO_AVAILABILITY",
        available: false,
        metadata: Object.freeze({
          provider: "hotelbeds",
          generatedAt: new Date(),
          version: "1.0.0",
        }),
      });
    }

    return mappingResult.result;
  }
}
