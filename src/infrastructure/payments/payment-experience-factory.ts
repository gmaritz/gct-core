import {
  CanonicalReservationPaymentContextResolver,
  DefaultPaymentInitiationService,
  createDefaultPaymentEngine,
} from "../../application/payments";
import { CanonicalReservationPrismaRepository } from "../persistence/repositories";
import { DefaultPayFastGateway } from "./payfast";

export function createCanonicalPaymentContextResolver(): CanonicalReservationPaymentContextResolver {
  return new CanonicalReservationPaymentContextResolver(new CanonicalReservationPrismaRepository());
}

export function createDefaultPaymentInitiationService(): DefaultPaymentInitiationService {
  return new DefaultPaymentInitiationService(createDefaultPaymentEngine(), new DefaultPayFastGateway());
}
