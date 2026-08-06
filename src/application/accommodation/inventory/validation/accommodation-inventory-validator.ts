import { AccommodationInventoryQuery } from "../models";
import { AccommodationInventorySource } from "../models/accommodation-inventory-source";

import { AccommodationInventoryValidationErrorCode } from "./accommodation-inventory-validation-error-code";
import { AccommodationInventoryValidationError } from "./accommodation-inventory-validation-error";
import { AccommodationInventoryValidationResult } from "./accommodation-inventory-validation-result";

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
  code: AccommodationInventoryValidationErrorCode,
  field: string,
  message: string,
): AccommodationInventoryValidationError {
  return Object.freeze({ code, field, message });
}

export class AccommodationInventoryValidator {
  public validate(query: AccommodationInventoryQuery): AccommodationInventoryValidationResult {
    const errors: AccommodationInventoryValidationError[] = [];

    if (isBlank(query.identifier)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.MISSING_IDENTIFIER,
          "identifier",
          "Identifier is required.",
        ),
      );
    }

    const hasCheckIn = isValidDate(query.checkInDate);
    const hasCheckOut = isValidDate(query.checkOutDate);

    if (!hasCheckIn) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.MISSING_CHECK_IN,
          "checkInDate",
          "Check-in date is required.",
        ),
      );
    }

    if (!hasCheckOut) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.MISSING_CHECK_OUT,
          "checkOutDate",
          "Check-out date is required.",
        ),
      );
    }

    if (hasCheckIn && hasCheckOut && query.checkOutDate.getTime() <= query.checkInDate.getTime()) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.INVALID_DATE_RANGE,
          "checkOutDate",
          "Check-out date must be after check-in date.",
        ),
      );
    }

    if (!isValidCount(query.adults, 1)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.INVALID_ADULT_COUNT,
          "adults",
          "Adults must be at least 1.",
        ),
      );
    }

    if (!isValidCount(query.children, 0)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.INVALID_CHILD_COUNT,
          "children",
          "Children must be 0 or greater.",
        ),
      );
    }

    if (!isValidCount(query.rooms, 1)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.INVALID_ROOM_COUNT,
          "rooms",
          "Rooms must be at least 1.",
        ),
      );
    }

    if (isBlank(query.context.requestId)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.MISSING_REQUEST_ID,
          "context.requestId",
          "Request ID is required.",
        ),
      );
    }

    if (isBlank(query.context.source as AccommodationInventorySource)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.MISSING_SOURCE,
          "context.source",
          "Source is required.",
        ),
      );
    }

    if (!isValidDate(query.context.timestamp)) {
      errors.push(
        createError(
          AccommodationInventoryValidationErrorCode.MISSING_TIMESTAMP,
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