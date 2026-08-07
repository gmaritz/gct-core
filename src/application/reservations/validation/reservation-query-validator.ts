import { ReservationValidationErrorCode } from "./models";
import { createReservationValidationResult, ReservationValidationResult } from "./models";

export interface ReservationTravellerRequest {
  readonly travellerId: string;
  readonly fullName: string;
  readonly email?: string;
  readonly dateOfBirth?: Date;
}

export interface ReservationQuery {
  readonly requestId: string;
  readonly journeyId: string;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly travellers: ReadonlyArray<ReservationTravellerRequest>;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function createError(code: ReservationValidationErrorCode, message: string) {
  return Object.freeze({ code, message });
}

export class ReservationQueryValidator {
  public validate(query: ReservationQuery | null | undefined): ReservationValidationResult {
    const errors = [] as ReturnType<typeof createError>[];

    if (typeof query !== "object" || query === null) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_QUERY, "Reservation query is required."));
      return createReservationValidationResult({
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "ReservationQueryValidator",
        },
      });
    }

    if (isBlank(query.requestId) || isBlank(query.journeyId) || !Array.isArray(query.travellers) || query.travellers.length === 0) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_STRUCTURE, "Reservation query structure is invalid."));
    }

    if (!isValidDate(query.checkInDate) || !isValidDate(query.checkOutDate) || query.checkOutDate <= query.checkInDate) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_DATES, "Reservation dates are invalid."));
    }

    if (!Array.isArray(query.travellers) || query.travellers.some((traveller) => isBlank(traveller?.travellerId) || isBlank(traveller?.fullName))) {
      errors.push(createError(ReservationValidationErrorCode.INVALID_TRAVELLER, "Traveller details are invalid."));
    }

    return createReservationValidationResult({
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "ReservationQueryValidator",
      },
    });
  }
}
