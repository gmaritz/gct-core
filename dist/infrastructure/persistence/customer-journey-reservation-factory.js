"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerJourneyReservationService = createCustomerJourneyReservationService;
const customers_1 = require("../../application/customers");
const merchandising_1 = require("../../application/merchandising");
const reservations_1 = require("../../application/reservations");
const booking_1 = require("../../application/accommodation/booking");
const revalidation_1 = require("../../application/accommodation/revalidation");
const registry_1 = require("../../application/accommodation/registry");
const hotelbeds_1 = require("../../application/accommodation/providers/hotelbeds");
const accommodation_booking_orchestration_1 = require("../../application/reservations/service/accommodation-booking-orchestration");
const journey_quote_service_1 = require("../../application/merchandising/homepage/showcase/journey-quote-service");
const repositories_1 = require("./repositories");
function createCustomerJourneyReservationService() {
    const reservationRepository = new repositories_1.CanonicalReservationPrismaRepository();
    const reservationService = new reservations_1.ReservationService(new reservations_1.ReservationValidationPipeline({
        queryValidator: new reservations_1.ReservationQueryValidator(),
        snapshotValidator: new reservations_1.ReservationSnapshotValidator(),
        integrityValidator: new reservations_1.CommercialIntegrityValidator(),
    }), new reservations_1.ReservationPolicyPipeline(), new reservations_1.ReservationBuilder({ validate: () => ({ valid: true, errors: [], warnings: [] }) }), reservationRepository);
    const providerRegistry = new registry_1.InMemoryProviderRegistry();
    providerRegistry.register(new hotelbeds_1.HotelbedsProvider());
    const bookingOrchestration = new accommodation_booking_orchestration_1.AccommodationBookingOrchestrationService((0, journey_quote_service_1.createDefaultPricingEngine)(), reservationService, new revalidation_1.AccommodationRateRevalidationService(providerRegistry), new booking_1.AccommodationBookingService(providerRegistry), reservationRepository);
    return new merchandising_1.CustomerJourneyReservationService(new customers_1.CustomerResolutionService(new repositories_1.CustomerPrismaRepository()), reservationService, bookingOrchestration);
}
//# sourceMappingURL=customer-journey-reservation-factory.js.map