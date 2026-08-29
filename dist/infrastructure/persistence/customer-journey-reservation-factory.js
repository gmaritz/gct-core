"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerJourneyReservationService = createCustomerJourneyReservationService;
const customers_1 = require("../../application/customers");
const merchandising_1 = require("../../application/merchandising");
const reservations_1 = require("../../application/reservations");
const repositories_1 = require("./repositories");
function createCustomerJourneyReservationService() {
    const reservationService = new reservations_1.ReservationService(new reservations_1.ReservationValidationPipeline({
        queryValidator: new reservations_1.ReservationQueryValidator(),
        snapshotValidator: new reservations_1.ReservationSnapshotValidator(),
        integrityValidator: new reservations_1.CommercialIntegrityValidator(),
    }), new reservations_1.ReservationPolicyPipeline(), new reservations_1.ReservationBuilder({ validate: () => ({ valid: true, errors: [], warnings: [] }) }), new repositories_1.CanonicalReservationPrismaRepository());
    return new merchandising_1.CustomerJourneyReservationService(new customers_1.CustomerResolutionService(new repositories_1.CustomerPrismaRepository()), reservationService);
}
//# sourceMappingURL=customer-journey-reservation-factory.js.map