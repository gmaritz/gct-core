import {
  AccommodationSnapshot,
  JourneySnapshot,
  PaymentSnapshot,
  PricingSnapshot,
  ReservationMetadata,
  TravellerSnapshot,
} from "../models";
import { ReservationValidationErrorCode, createReservationValidationResult, ReservationValidationResult } from "./models";

export interface ReservationSnapshotSet {
  readonly journeySnapshot?: JourneySnapshot;
  readonly travellerSnapshots?: ReadonlyArray<TravellerSnapshot>;
  readonly accommodationSnapshots?: ReadonlyArray<AccommodationSnapshot>;
  readonly pricingSnapshot?: PricingSnapshot;
  readonly paymentSnapshot?: PaymentSnapshot;
  readonly metadata?: ReservationMetadata;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function createError(
  code: ReservationValidationErrorCode,
  message: string,
): Readonly<{ readonly code: ReservationValidationErrorCode; readonly message: string }> {
  return Object.freeze({ code, message });
}

export class ReservationSnapshotValidator {
  public validate(snapshotSet: ReservationSnapshotSet | null | undefined): ReservationValidationResult {
    const errors = [] as ReturnType<typeof createError>[];

    if (typeof snapshotSet !== "object" || snapshotSet === null) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_SNAPSHOT, "Reservation snapshot set is required."));
      return createReservationValidationResult({
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "ReservationSnapshotValidator",
        },
      });
    }

    if (!snapshotSet.journeySnapshot || isBlank(snapshotSet.journeySnapshot.journeyId) || isBlank(snapshotSet.journeySnapshot.snapshotId)) {
      errors.push(createError(ReservationValidationErrorCode.MISSING_JOURNEY_SNAPSHOT, "Journey snapshot is required."));
    }

    if (!Array.isArray(snapshotSet.travellerSnapshots) || snapshotSet.travellerSnapshots.length === 0) {
      errors.push(createError(ReservationValidationErrorCode.MISSING_TRAVELLER_SNAPSHOT, "At least one traveller snapshot is required."));
    } else if (snapshotSet.travellerSnapshots.some((traveller) => isBlank(traveller.snapshotId) || isBlank(traveller.travellerId))) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_SNAPSHOT, "Traveller snapshots are invalid."));
    }

    if (snapshotSet.pricingSnapshot && (isBlank(snapshotSet.pricingSnapshot.snapshotId) || isBlank(snapshotSet.pricingSnapshot.currency))) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_PRICING_SNAPSHOT, "Pricing snapshot is invalid."));
    }

    if (snapshotSet.paymentSnapshot && (isBlank(snapshotSet.paymentSnapshot.snapshotId) || isBlank(snapshotSet.paymentSnapshot.paymentStatus))) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_PAYMENT_SNAPSHOT, "Payment snapshot is invalid."));
    }

    if (snapshotSet.metadata && (isBlank(snapshotSet.metadata.version) || !isValidDate(snapshotSet.metadata.createdAt) || !isValidDate(snapshotSet.metadata.updatedAt))) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_METADATA, "Reservation metadata is invalid."));
    }

    return createReservationValidationResult({
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "ReservationSnapshotValidator",
      },
    });
  }
}
