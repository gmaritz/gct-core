import { PaymentAttempt, PaymentAttemptRepository } from "./payment-attempt";
import { PaymentInitiationRequest, PaymentContextResolver } from "./payment-initiation-service";
import { PaymentStatus } from "./models";

export interface PaymentAttemptCallback {
  readonly context: PaymentInitiationRequest;
  readonly attempt: PaymentAttempt;
}

export class PaymentAttemptCallbackResolver {
  public constructor(
    private readonly paymentContextResolver: PaymentContextResolver,
    private readonly paymentAttemptRepository: Pick<PaymentAttemptRepository, "findByPaymentReference">,
    private readonly environment: PaymentAttempt["environment"],
  ) {}

  public async resolve(journeyId: string, paymentReference: string): Promise<PaymentAttemptCallback | null> {
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
    if (
      !attempt
      || attempt.paymentReference !== paymentReference
      || attempt.reservationId !== context.reservationId
      || attempt.paymentId !== paymentId
      || attempt.provider !== "PAYFAST"
      || attempt.environment !== this.environment
      || !Object.values(PaymentStatus).includes(attempt.status)
    ) {
      return null;
    }

    return Object.freeze({ context, attempt });
  }
}
