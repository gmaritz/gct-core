import { AccommodationSearchQuery } from "../accommodation-search-query";
import { AccommodationSearchSource } from "../accommodation-search-source";

import { AccommodationValidationErrorCode } from "./accommodation-validation-error-code";
import { AccommodationValidationError } from "./accommodation-validation-error";
import { AccommodationValidationResult } from "./accommodation-validation-result";
import { isValidExplicitHotelCode } from "./hotel-code-validation";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function isValidCount(value: unknown, minimum: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}

function createError(
  code: AccommodationValidationErrorCode,
  field: string,
  message: string,
): AccommodationValidationError {
  return Object.freeze({ code, field, message });
}

export class AccommodationQueryValidator {
  public validate(query: AccommodationSearchQuery): AccommodationValidationResult {
    const errors: AccommodationValidationError[] = [];
    const { criteria, context } = query;

    if (isBlank(criteria.destination)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.MISSING_DESTINATION,
          "criteria.destination",
          "Destination is required.",
        ),
      );
    }

    const hasCheckIn = isValidDate(criteria.checkInDate);
    const hasCheckOut = isValidDate(criteria.checkOutDate);

    if (!hasCheckIn) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.MISSING_CHECK_IN,
          "criteria.checkInDate",
          "Check-in date is required.",
        ),
      );
    }

    if (!hasCheckOut) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.MISSING_CHECK_OUT,
          "criteria.checkOutDate",
          "Check-out date is required.",
        ),
      );
    }

    if (hasCheckIn && hasCheckOut && criteria.checkOutDate.getTime() <= criteria.checkInDate.getTime()) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.INVALID_DATE_RANGE,
          "criteria.checkOutDate",
          "Check-out date must be after check-in date.",
        ),
      );
    }

    if (!isValidCount(criteria.adults, 1)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.INVALID_ADULT_COUNT,
          "criteria.adults",
          "Adults must be at least 1.",
        ),
      );
    }

    if (!isValidCount(criteria.children, 0)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.INVALID_CHILD_COUNT,
          "criteria.children",
          "Children must be 0 or greater.",
        ),
      );
    }

    if (!isValidCount(criteria.rooms, 1)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.INVALID_ROOM_COUNT,
          "criteria.rooms",
          "Rooms must be at least 1.",
        ),
      );
    }

    for (const [index, hotelCode] of (criteria.hotelCodes ?? []).entries()) {
      if (!isValidExplicitHotelCode(hotelCode)) {
        errors.push(
          createError(
            AccommodationValidationErrorCode.INVALID_HOTEL_CODE,
            `criteria.hotelCodes[${index}]`,
            "Explicit hotel codes must be positive safe integers represented as digits only.",
          ),
        );
      }
    }

    if (isBlank(context.requestId)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.MISSING_REQUEST_ID,
          "context.requestId",
          "Request ID is required.",
        ),
      );
    }

    if (isBlank(context.source as AccommodationSearchSource)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.MISSING_SOURCE,
          "context.source",
          "Source is required.",
        ),
      );
    }

    if (!isValidDate(context.timestamp)) {
      errors.push(
        createError(
          AccommodationValidationErrorCode.MISSING_TIMESTAMP,
          "context.timestamp",
          "Timestamp is required.",
        ),
      );
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }
}