import { PaymentAttempt, PaymentAttemptRepository } from "./payment-attempt";
import { PaymentInitiationRequest, PaymentContextResolver } from "./payment-initiation-service";
export interface PaymentAttemptCallback {
    readonly context: PaymentInitiationRequest;
    readonly attempt: PaymentAttempt;
}
export declare class PaymentAttemptCallbackResolver {
    private readonly paymentContextResolver;
    private readonly paymentAttemptRepository;
    private readonly environment;
    constructor(paymentContextResolver: PaymentContextResolver, paymentAttemptRepository: Pick<PaymentAttemptRepository, "findByPaymentReference">, environment: PaymentAttempt["environment"]);
    resolve(journeyId: string, paymentReference: string): Promise<PaymentAttemptCallback | null>;
}
//# sourceMappingURL=payment-callback-service.d.ts.map