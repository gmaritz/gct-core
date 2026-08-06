import {
  AccommodationCurrency,
  AccommodationRateQuery,
  AccommodationRateSelectionStrategy,
  AccommodationRateSource,
} from "../models";

import { AccommodationRateValidationErrorCode } from "./accommodation-rate-validation-error-code";
import { AccommodationRateValidationError } from "./accommodation-rate-validation-error";
import { AccommodationRateValidationResult } from "./accommodation-rate-validation-result";

const RATE_CURRENCIES = new Set<string>(Object.values(AccommodationCurrency));
const RATE_SOURCES = new Set<string>(Object.values(AccommodationRateSource));
const RATE_SELECTION_STRATEGIES = new Set<string>(Object.values(AccommodationRateSelectionStrategy));

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
  code: AccommodationRateValidationErrorCode,
  field: string,
  message: string,
): AccommodationRateValidationError {
  return Object.freeze({ code, field, message });
}

export class AccommodationRateValidator {
  public validate(query: AccommodationRateQuery): AccommodationRateValidationResult {
    const errors: AccommodationRateValidationError[] = [];

    if (isBlank(query.identifier)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_IDENTIFIER,
          "identifier",
          "Identifier is required.",
        ),
      );
    }

    const hasCheckIn = isValidDate(query.stayPeriod.checkIn);
    const hasCheckOut = isValidDate(query.stayPeriod.checkOut);

    if (!hasCheckIn) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_CHECK_IN,
          "stayPeriod.checkIn",
          "Check-in date is required.",
        ),
      );
    }

    if (!hasCheckOut) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_CHECK_OUT,
          "stayPeriod.checkOut",
          "Check-out date is required.",
        ),
      );
    }

    if (hasCheckIn && hasCheckOut && query.stayPeriod.checkOut.getTime() <= query.stayPeriod.checkIn.getTime()) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_DATE_RANGE,
          "stayPeriod.checkOut",
          "Check-out date must be after check-in date.",
        ),
      );
    }

    if (!isValidCount(query.occupancy.adults, 1)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_ADULT_COUNT,
          "occupancy.adults",
          "Adults must be at least 1.",
        ),
      );
    }

    if (!isValidCount(query.occupancy.children, 0)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_CHILD_COUNT,
          "occupancy.children",
          "Children must be 0 or greater.",
        ),
      );
    }

    if (!isValidCount(query.occupancy.rooms, 1)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_ROOM_COUNT,
          "occupancy.rooms",
          "Rooms must be at least 1.",
        ),
      );
    }

    if (isBlank(query.context.requestId)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_REQUEST_ID,
          "context.requestId",
          "Request ID is required.",
        ),
      );
    }

    if (query.context.source === undefined || query.context.source === null) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_SOURCE,
          "context.source",
          "Source is required.",
        ),
      );
    } else if (!RATE_SOURCES.has(query.context.source)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_SOURCE,
          "context.source",
          "Source is invalid.",
        ),
      );
    }

    if (query.context.currency === undefined || query.context.currency === null) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_CURRENCY,
          "context.currency",
          "Currency is required.",
        ),
      );
    } else if (!RATE_CURRENCIES.has(query.context.currency)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_CURRENCY,
          "context.currency",
          "Currency is invalid.",
        ),
      );
    }

    if (isBlank(query.context.market)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_MARKET,
          "context.market",
          "Market is required.",
        ),
      );
    }

    if (!isValidDate(query.context.timestamp)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.MISSING_TIMESTAMP,
          "context.timestamp",
          "Timestamp is required.",
        ),
      );
    }

    if (!RATE_SELECTION_STRATEGIES.has(query.selectionStrategy)) {
      errors.push(
        createError(
          AccommodationRateValidationErrorCode.INVALID_SELECTION_STRATEGY,
          "selectionStrategy",
          "Selection strategy is invalid.",
        ),
      );
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }
}