import { CustomerResolutionService } from "../../application/customers";
import {
  CustomerJourneyReservationService,
} from "../../application/merchandising";
import {
  ReservationBuilder,
  ReservationPolicyPipeline,
  ReservationQueryValidator,
  ReservationService,
  ReservationSnapshotValidator,
  ReservationValidationPipeline,
  CommercialIntegrityValidator,
} from "../../application/reservations";
import { CustomerPrismaRepository, CanonicalReservationPrismaRepository } from "./repositories";

export function createCustomerJourneyReservationService(): CustomerJourneyReservationService {
  const reservationService = new ReservationService(
    new ReservationValidationPipeline({
      queryValidator: new ReservationQueryValidator(),
      snapshotValidator: new ReservationSnapshotValidator(),
      integrityValidator: new CommercialIntegrityValidator(),
    }),
    new ReservationPolicyPipeline(),
    new ReservationBuilder({ validate: () => ({ valid: true, errors: [], warnings: [] }) }),
    new CanonicalReservationPrismaRepository(),
  );
  return new CustomerJourneyReservationService(
    new CustomerResolutionService(new CustomerPrismaRepository()),
    reservationService,
  );
}