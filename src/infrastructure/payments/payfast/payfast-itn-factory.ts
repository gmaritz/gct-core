import { CanonicalReservationPrismaRepository } from "../../persistence/repositories/canonical-reservation-prisma.repository";
import { PaymentAttemptPrismaRepository } from "../../persistence/repositories/payment-attempt-prisma.repository";
import { FetchPayFastItnServerValidator } from "./payfast-itn-security";
import { PayFastItnProcessor } from "./payfast-itn-processor";
import { loadPayFastIntegrationConfig } from "./index";

export function createPayFastItnProcessor(): PayFastItnProcessor {
  const config = loadPayFastIntegrationConfig();
  return new PayFastItnProcessor(
    config,
    new PaymentAttemptPrismaRepository(),
    new CanonicalReservationPrismaRepository(),
    new FetchPayFastItnServerValidator(config.timeoutMs),
  );
}
