import {
  ReservationStatus,
  Reservation,
} from "../aggregate";
import {
  CommercialIntegrityFinding,
  ReservationValidationResult,
  createReservationValidationResult,
} from "./models";

export interface CommercialIntegrityInput {
  readonly reservation: Reservation;
}

function createFinding(code: string, message: string): CommercialIntegrityFinding {
  return Object.freeze({ code, message });
}

export class CommercialIntegrityValidator {
  public validate(input: CommercialIntegrityInput | null | undefined): ReservationValidationResult {
    const findings = [] as CommercialIntegrityFinding[];

    if (typeof input !== "object" || input === null) {
      findings.push(createFinding("INVALID_INPUT", "Reservation input is required."));
      return createReservationValidationResult({
        integrityFindings: findings,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "CommercialIntegrityValidator",
        },
      });
    }

    const reservation = input.reservation;
    const pricingSnapshot = reservation.pricingSnapshot;
    const paymentSnapshot = reservation.paymentSnapshot;

    if (pricingSnapshot && pricingSnapshot.totalPrice < 0) {
      findings.push(createFinding("INCONSISTENT_PRICING", "Pricing snapshot contains an inconsistent total price."));
    }

    if (paymentSnapshot && reservation.status === ReservationStatus.CONFIRMED && paymentSnapshot.balanceOutstanding > 0) {
      findings.push(createFinding("PAYMENT_INCOMPATIBLE", "Confirmed reservations should not have an outstanding balance."));
    }

    if (reservation.supplierReferences.length === 0) {
      findings.push(createFinding("MISSING_SUPPLIER_REFERENCE", "Reservation is missing supplier references."));
    }

    if (reservation.travellerSnapshots.length === 0) {
      findings.push(createFinding("TRAVELLER_MISMATCH", "Reservation traveller snapshots are missing."));
    }

    return createReservationValidationResult({
      integrityFindings: findings,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "CommercialIntegrityValidator",
      },
    });
  }
}
