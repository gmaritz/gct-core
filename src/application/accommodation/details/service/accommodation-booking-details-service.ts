import { ApplicationService } from "../../../application-service";
import { AccommodationProvider } from "../../providers";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { ProviderRegistry } from "../../registry";
import { AccommodationBookingDetailsRequest, AccommodationBookingDetailsResult } from "../models";

export interface AccommodationBookingDetailsProvider extends AccommodationProvider {
  getBookingDetails(request: AccommodationBookingDetailsRequest): Promise<AccommodationBookingDetailsResult>;
}

function hasDetails(provider: AccommodationProvider): provider is AccommodationBookingDetailsProvider {
  return typeof (provider as AccommodationBookingDetailsProvider).getBookingDetails === "function";
}

export class AccommodationBookingDetailsService
  implements ApplicationService<AccommodationBookingDetailsRequest, AccommodationBookingDetailsResult> {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async execute(request: AccommodationBookingDetailsRequest): Promise<AccommodationBookingDetailsResult> {
    if (!request.provider.trim()) throw new Error("Booking details provider is required.");
    if (!request.supplierBookingReference.trim()) throw new Error("Supplier booking reference is required.");

    const provider = this.providerRegistry
      .findProviders(AccommodationProviderCapabilityType.BOOKING_DETAILS)
      .find((candidate): candidate is AccommodationBookingDetailsProvider => hasDetails(candidate));

    if (!provider) {
      return Object.freeze({
        successful: false,
        status: "FAILED",
        reservationId: request.reservationId,
        provider: request.provider,
        supplierBookingReference: request.supplierBookingReference,
        rooms: Object.freeze([]),
        packageStopId: request.packageStopId,
        errors: Object.freeze([{ code: "UNSUPPORTED", message: "Booking details are not supported by the original provider." }]),
        warnings: Object.freeze([]),
      });
    }
    if (provider.providerId !== request.provider) throw new Error("Booking details provider does not match the original booking provider.");
    return provider.getBookingDetails(request);
  }
}