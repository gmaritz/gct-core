import { ApplicationService } from "../../../application-service";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { ProviderRegistry } from "../../registry";
import { AccommodationProvider } from "../../providers";
import {
  AccommodationRateRevalidationRequest,
  AccommodationRateRevalidationResult,
} from "../models";

export interface AccommodationRateRevalidationProvider extends AccommodationProvider {
  revalidate(request: AccommodationRateRevalidationRequest): Promise<AccommodationRateRevalidationResult>;
}

function hasRevalidation(provider: unknown): provider is AccommodationRateRevalidationProvider {
  return typeof (provider as AccommodationRateRevalidationProvider | undefined)?.revalidate === "function";
}

function freezeRequest(request: AccommodationRateRevalidationRequest): AccommodationRateRevalidationRequest {
  return Object.freeze({
    ...request,
    stayPeriod: Object.freeze({ ...request.stayPeriod }),
    occupancy: Object.freeze({
      rooms: Object.freeze(request.occupancy.rooms.map((room) => Object.freeze({
        adults: room.adults,
        children: room.children,
        childAges: Object.freeze([...room.childAges]),
      }))),
    }),
  });
}

export class AccommodationRateRevalidationService
  implements ApplicationService<AccommodationRateRevalidationRequest, AccommodationRateRevalidationResult> {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async execute(
    request: AccommodationRateRevalidationRequest,
  ): Promise<AccommodationRateRevalidationResult> {
    const frozenRequest = freezeRequest(request);

    if (frozenRequest.providerReference.provider !== request.rate.reference.provider) {
      throw new Error("Revalidation provider reference does not match the selected rate.");
    }

    if (request.rate.status === "BOOKABLE") {
      return Object.freeze({
        status: "VALID",
        accommodation: request.accommodation,
        room: request.room,
        previousRate: request.rate,
        currentRate: request.rate,
        packageStopId: request.packageStopId,
        provider: request.providerReference.provider,
      });
    }

    if (request.rate.status !== "RECHECK_REQUIRED") {
      throw new Error("Only BOOKABLE and RECHECK_REQUIRED rates can be revalidated.");
    }

    const provider = this.providerRegistry
      .findProviders(AccommodationProviderCapabilityType.REVALIDATION)
      .find((candidate): candidate is AccommodationRateRevalidationProvider => hasRevalidation(candidate));

    if (!provider) {
      throw new Error("No accommodation rate revalidation provider is registered.");
    }

    return provider.revalidate(frozenRequest);
  }
}