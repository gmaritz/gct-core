import { CustomerResolutionService } from "../../application/customers";
import {
  CustomerJourneyReservationService,
} from "../../application/merchandising";
import {
  ReservationBuilder,
  ReservationPolicyPipeline,
  ReservationQueryValidator,
  ReservationService,
  ReservationSnapshotValidator,
  ReservationValidationPipeline,
  CommercialIntegrityValidator,
} from "../../application/reservations";
import { AccommodationBookingService } from "../../application/accommodation/booking";
import { AccommodationRateRevalidationService } from "../../application/accommodation/revalidation";
import { InMemoryProviderRegistry } from "../../application/accommodation/registry";
import { HotelbedsProvider } from "../../application/accommodation/providers/hotelbeds";
import { AccommodationBookingOrchestrationService } from "../../application/reservations/service/accommodation-booking-orchestration";
import { createDefaultPricingEngine } from "../../application/merchandising/homepage/showcase/journey-quote-service";
import { CustomerPrismaRepository, CanonicalReservationPrismaRepository } from "./repositories";

export function createCustomerJourneyReservationService(): CustomerJourneyReservationService {
  const reservationRepository = new CanonicalReservationPrismaRepository();
  const reservationService = new ReservationService(
    new ReservationValidationPipeline({
      queryValidator: new ReservationQueryValidator(),
      snapshotValidator: new ReservationSnapshotValidator(),
      integrityValidator: new CommercialIntegrityValidator(),
    }),
    new ReservationPolicyPipeline(),
    new ReservationBuilder({ validate: () => ({ valid: true, errors: [], warnings: [] }) }),
    reservationRepository,
  );
  const providerRegistry = new InMemoryProviderRegistry();
  providerRegistry.register(new HotelbedsProvider());
  const bookingOrchestration = new AccommodationBookingOrchestrationService(
    createDefaultPricingEngine(),
    reservationService,
    new AccommodationRateRevalidationService(providerRegistry),
    new AccommodationBookingService(providerRegistry),
    reservationRepository,
  );
  return new CustomerJourneyReservationService(
    new CustomerResolutionService(new CustomerPrismaRepository()),
    reservationService,
    bookingOrchestration,
  );
}