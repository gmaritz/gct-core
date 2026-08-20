import { ApplicationService } from "../../../application-service";
import { AccommodationProvider } from "../../providers";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { ProviderRegistry } from "../../registry";
import { AccommodationBookingModificationRequest, AccommodationBookingModificationResult } from "../models";

export interface AccommodationBookingModificationProvider extends AccommodationProvider {
  modifyBooking(request: AccommodationBookingModificationRequest): Promise<AccommodationBookingModificationResult>;
}

function hasModification(provider: AccommodationProvider): provider is AccommodationBookingModificationProvider {
  return typeof (provider as AccommodationBookingModificationProvider).modifyBooking === "function";
}

function validate(request: AccommodationBookingModificationRequest): void {
  if (!request.reservationId.trim()) throw new Error("Modification reservation identity is required.");
  if (!request.provider.trim()) throw new Error("Modification provider is required.");
  if (!request.supplierBookingReference.trim()) throw new Error("Modification supplier booking reference is required.");
  if (!request.idempotencyKey.trim()) throw new Error("Modification idempotency key is required.");
  if (request.reservationStatus === "CANCELLED") throw new Error("Cancelled accommodation bookings cannot be modified.");
  if (request.reservationStatus === "UNKNOWN") throw new Error("Unknown accommodation bookings cannot be modified.");
  if (request.reservationStatus !== "CONFIRMED") throw new Error("Only confirmed accommodation bookings can be modified.");
  if (!Object.values(request.changes).some((change) => change !== undefined)) {
    throw new Error("At least one booking modification is required.");
  }
  if (request.changes.stayPeriod && request.changes.stayPeriod.checkIn >= request.changes.stayPeriod.checkOut) {
    throw new Error("Invalid modification stay period.");
  }
  if (request.changes.occupancy && request.changes.occupancy.rooms.length === 0) {
    throw new Error("Modification occupancy requires at least one room.");
  }
  if (request.changes.guests?.some((guest) => guest.roomIndex < 0 ||
    (request.changes.occupancy && guest.roomIndex >= request.changes.occupancy.rooms.length))) {
    throw new Error("Modification guest room association is invalid.");
  }
  if (request.changes.rate?.status === "RECHECK_REQUIRED" && request.validatedRate?.status !== "BOOKABLE") {
    throw new Error("Modified RECHECK rate requires successful revalidation.");
  }
}

export class AccommodationBookingModificationService
  implements ApplicationService<AccommodationBookingModificationRequest, AccommodationBookingModificationResult> {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async execute(request: AccommodationBookingModificationRequest): Promise<AccommodationBookingModificationResult> {
    validate(request);
    const provider = this.providerRegistry
      .findProviders(AccommodationProviderCapabilityType.MODIFICATION)
      .find((candidate): candidate is AccommodationBookingModificationProvider => hasModification(candidate));

    if (!provider) {
      return Object.freeze({
        successful: false,
        status: "UNSUPPORTED",
        reservationId: request.reservationId,
        provider: request.provider,
        supplierBookingReference: request.supplierBookingReference,
        packageStopId: request.packageStopId,
        errors: Object.freeze([{ code: "UNSUPPORTED", message: "Accommodation modification is not supported by the original provider." }]),
        warnings: Object.freeze([]),
      });
    }
    if (provider.providerId !== request.provider) throw new Error("Modification provider does not match the original booking provider.");
    return provider.modifyBooking(request);
  }
}