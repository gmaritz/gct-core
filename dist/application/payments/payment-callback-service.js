"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAttemptCallbackResolver = void 0;
const models_1 = require("./models");
class PaymentAttemptCallbackResolver {
    constructor(paymentContextResolver, paymentAttemptRepository, environment) {
        this.paymentContextResolver = paymentContextResolver;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.environment = environment;
    }
    async resolve(journeyId, paymentReference) {
        if (!/^journey-[a-z0-9-]{1,120}$/i.test(journeyId)
            || !/^gct-[a-z0-9-]{1,96}$/i.test(paymentReference)) {
            return null;
        }
        const context = await this.paymentContextResolver.resolveForJourney(journeyId);
        if (!context || context.journeyId !== journeyId) {
            return null;
        }
        const attempt = await this.paymentAttemptRepository.findByPaymentReference(paymentReference);
        const paymentRequest = context.engineRequest.paymentRequest;
        const paymentId = paymentRequest.reference?.paymentId;
        if (!attempt
            || attempt.paymentReference !== paymentReference
            || attempt.reservationId !== context.reservationId
            || attempt.paymentId !== paymentId
            || attempt.provider !== "PAYFAST"
            || attempt.environment !== this.environment
            || !Object.values(models_1.PaymentStatus).includes(attempt.status)) {
            return null;
        }
        return Object.freeze({ context, attempt });
    }
}
exports.PaymentAttemptCallbackResolver = PaymentAttemptCallbackResolver;
//# sourceMappingURL=payment-callback-service.js.map