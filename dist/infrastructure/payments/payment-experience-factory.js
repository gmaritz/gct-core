"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanonicalPaymentContextResolver = createCanonicalPaymentContextResolver;
exports.createDefaultPaymentInitiationService = createDefaultPaymentInitiationService;
const payments_1 = require("../../application/payments");
const repositories_1 = require("../persistence/repositories");
const payfast_1 = require("./payfast");
function createCanonicalPaymentContextResolver() {
    return new payments_1.CanonicalReservationPaymentContextResolver(new repositories_1.CanonicalReservationPrismaRepository());
}
function createDefaultPaymentInitiationService() {
    return new payments_1.DefaultPaymentInitiationService((0, payments_1.createDefaultPaymentEngine)(), new payfast_1.DefaultPayFastGateway());
}
//# sourceMappingURL=payment-experience-factory.js.map