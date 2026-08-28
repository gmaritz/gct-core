import { DefaultReservationConfirmationService } from "../../application/reservations";
import { CanonicalReservationPrismaRepository } from "./repositories";

export function createReservationConfirmationService(): DefaultReservationConfirmationService {
  return new DefaultReservationConfirmationService(new CanonicalReservationPrismaRepository());
}
