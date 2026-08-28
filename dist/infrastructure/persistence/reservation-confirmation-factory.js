"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationConfirmationService = createReservationConfirmationService;
const reservations_1 = require("../../application/reservations");
const repositories_1 = require("./repositories");
function createReservationConfirmationService() {
    return new reservations_1.DefaultReservationConfirmationService(new repositories_1.CanonicalReservationPrismaRepository());
}
//# sourceMappingURL=reservation-confirmation-factory.js.map