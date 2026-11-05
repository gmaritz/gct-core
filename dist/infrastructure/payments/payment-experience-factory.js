"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanonicalPaymentContextResolver = createCanonicalPaymentContextResolver;
exports.createDefaultPaymentInitiationService = createDefaultPaymentInitiationService;
const payments_1 = require("../../application/payments");
const repositories_1 = require("../persistence/repositories");
const payment_attempt_prisma_repository_1 = require("../persistence/repositories/payment-attempt-prisma.repository");
const payfast_1 = require("./payfast");
function createCanonicalPaymentContextResolver() {
    return new payments_1.CanonicalReservationPaymentContextResolver(new repositories_1.CanonicalReservationPrismaRepository());
}
function createDefaultPaymentInitiationService() {
    const payFastConfig = (0, payfast_1.loadPayFastIntegrationConfig)();
    return new payments_1.DefaultPaymentInitiationService((0, payments_1.createDefaultPaymentEngine)(), new payfast_1.DefaultPayFastGateway(payFastConfig), new payment_attempt_prisma_repository_1.PaymentAttemptPrismaRepository(), payFastConfig.environment);
}
//# sourceMappingURL=payment-experience-factory.js.map