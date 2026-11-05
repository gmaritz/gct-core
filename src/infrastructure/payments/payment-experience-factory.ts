import {
  CanonicalReservationPaymentContextResolver,
  DefaultPaymentInitiationService,
  createDefaultPaymentEngine,
} from "../../application/payments";
import { CanonicalReservationPrismaRepository } from "../persistence/repositories";
import { PaymentAttemptPrismaRepository } from "../persistence/repositories/payment-attempt-prisma.repository";
import { DefaultPayFastGateway, loadPayFastIntegrationConfig } from "./payfast";

export function createCanonicalPaymentContextResolver(): CanonicalReservationPaymentContextResolver {
  return new CanonicalReservationPaymentContextResolver(new CanonicalReservationPrismaRepository());
}

export function createDefaultPaymentInitiationService(): DefaultPaymentInitiationService {
  const payFastConfig = loadPayFastIntegrationConfig();
  return new DefaultPaymentInitiationService(
    createDefaultPaymentEngine(),
    new DefaultPayFastGateway(payFastConfig),
    new PaymentAttemptPrismaRepository(),
    payFastConfig.environment,
  );
}
