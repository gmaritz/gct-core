import { CanonicalReservationPrismaRepository } from "../../persistence/repositories/canonical-reservation-prisma.repository";
import { PaymentAttemptPrismaRepository } from "../../persistence/repositories/payment-attempt-prisma.repository";
import { FetchPayFastItnServerValidator } from "./payfast-itn-security";
import { PayFastItnProcessor } from "./payfast-itn-processor";
import { loadPayFastIntegrationConfig, PayFastIntegrationConfig } from "./index";

export function createPayFastItnProcessor(
  config: PayFastIntegrationConfig = loadPayFastIntegrationConfig(),
): PayFastItnProcessor {
  return new PayFastItnProcessor(
    config,
    new PaymentAttemptPrismaRepository(),
    new CanonicalReservationPrismaRepository(),
    new FetchPayFastItnServerValidator(config.timeoutMs),
  );
}
