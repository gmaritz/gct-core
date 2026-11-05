"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayFastItnProcessor = createPayFastItnProcessor;
const canonical_reservation_prisma_repository_1 = require("../../persistence/repositories/canonical-reservation-prisma.repository");
const payment_attempt_prisma_repository_1 = require("../../persistence/repositories/payment-attempt-prisma.repository");
const payfast_itn_security_1 = require("./payfast-itn-security");
const payfast_itn_processor_1 = require("./payfast-itn-processor");
const index_1 = require("./index");
function createPayFastItnProcessor() {
    const config = (0, index_1.loadPayFastIntegrationConfig)();
    return new payfast_itn_processor_1.PayFastItnProcessor(config, new payment_attempt_prisma_repository_1.PaymentAttemptPrismaRepository(), new canonical_reservation_prisma_repository_1.CanonicalReservationPrismaRepository(), new payfast_itn_security_1.FetchPayFastItnServerValidator(config.timeoutMs));
}
//# sourceMappingURL=payfast-itn-factory.js.map