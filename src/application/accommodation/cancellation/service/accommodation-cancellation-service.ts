import { ApplicationService } from "../../../application-service";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { AccommodationProvider } from "../../providers";
import { ProviderRegistry } from "../../registry";
import {
  AccommodationCancellationRequest,
  AccommodationCancellationResult,
} from "../models";

export interface AccommodationCancellationProvider extends AccommodationProvider {
  cancelAccommodation(request: AccommodationCancellationRequest): Promise<AccommodationCancellationResult>;
}

function hasCancellation(provider: AccommodationProvider): provider is AccommodationCancellationProvider {
  return typeof (provider as AccommodationCancellationProvider).cancelAccommodation === "function";
}

function validate(request: AccommodationCancellationRequest): void {
  if (!request.reservationId.trim()) throw new Error("Cancellation reservation identity is required.");
  if (!request.provider.trim()) throw new Error("Cancellation provider is required.");
  if (!request.supplierBookingReference.trim()) throw new Error("Supplier booking reference is required.");
  if (!request.idempotencyKey.trim()) throw new Error("Cancellation idempotency key is required.");
  if (request.reservationStatus === "CANCELLED") return;
  if (request.reservationStatus !== "CONFIRMED") throw new Error("Only confirmed accommodation bookings can be cancelled.");
}

export class AccommodationCancellationService
  implements ApplicationService<AccommodationCancellationRequest, AccommodationCancellationResult> {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async execute(request: AccommodationCancellationRequest): Promise<AccommodationCancellationResult> {
    validate(request);

    if (request.reservationStatus === "CANCELLED") {
      return Object.freeze({
        successful: true,
        status: "ALREADY_CANCELLED",
        reservationId: request.reservationId,
        provider: request.provider,
        supplierBookingReference: request.supplierBookingReference,
        packageStopId: request.packageStopId,
        errors: Object.freeze([]),
        warnings: Object.freeze(["Accommodation booking was already cancelled."]),
      });
    }

    const provider = this.providerRegistry
      .findProviders(AccommodationProviderCapabilityType.CANCELLATION)
      .find((candidate): candidate is AccommodationCancellationProvider => hasCancellation(candidate));

    if (!provider) throw new Error(`No accommodation cancellation provider is registered for ${request.provider}.`);
    if (provider.providerId !== request.provider) {
      throw new Error("Cancellation provider does not match the confirmed booking provider.");
    }

    return provider.cancelAccommodation(request);
  }
}