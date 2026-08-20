import { ApplicationService } from "../../../application-service";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { ProviderRegistry } from "../../registry";
import { AccommodationProvider } from "../../providers";
import { AccommodationBookingRequest, AccommodationBookingResult } from "../models";

export interface AccommodationBookingProvider extends AccommodationProvider {
  book(request: AccommodationBookingRequest): Promise<AccommodationBookingResult>;
}

function hasBooking(provider: unknown): provider is AccommodationBookingProvider {
  return typeof (provider as AccommodationBookingProvider | undefined)?.book === "function";
}

function validateRequest(request: AccommodationBookingRequest): void {
  if (!request.providerReference.opaqueReference.trim()) throw new Error("Booking supplier reference is required.");
  if (!request.idempotencyKey.trim()) throw new Error("Booking idempotency key is required.");
  if (request.rate.status === "RECHECK_REQUIRED" && request.validatedRate?.status !== "BOOKABLE") {
    throw new Error("RECHECK rate requires a successful revalidation result before booking.");
  }
  if (request.rate.status !== "BOOKABLE" && request.rate.status !== "RECHECK_REQUIRED") {
    throw new Error("Selected rate is not bookable.");
  }
  if (request.stayPeriod.checkIn >= request.stayPeriod.checkOut) throw new Error("Invalid booking stay period.");
  if (request.occupancy.rooms.length === 0) throw new Error("Booking occupancy requires at least one room.");
  if (request.guests.some((guest) => guest.roomIndex < 0 || guest.roomIndex >= request.occupancy.rooms.length)) {
    throw new Error("Booking guest room association is invalid.");
  }
  if (request.guests.some((guest) => guest.type === "CHILD" && (guest.age === undefined || guest.age < 0))) {
    throw new Error("Child booking guests require a valid age.");
  }
}

export class AccommodationBookingService
  implements ApplicationService<AccommodationBookingRequest, AccommodationBookingResult> {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async execute(request: AccommodationBookingRequest): Promise<AccommodationBookingResult> {
    validateRequest(request);
    const provider = this.providerRegistry
      .findProviders(AccommodationProviderCapabilityType.BOOKING)
      .find((candidate): candidate is AccommodationBookingProvider => hasBooking(candidate));

    if (!provider) throw new Error("No accommodation booking provider is registered.");
    return provider.book(request);
  }
}