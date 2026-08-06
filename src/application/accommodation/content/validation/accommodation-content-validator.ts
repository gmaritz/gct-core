import { AccommodationContentLocale } from "../models";
import { AccommodationContentQuery } from "../models/accommodation-content-query";
import { AccommodationContentSource } from "../models/accommodation-content-source";

import { AccommodationContentValidationErrorCode } from "./accommodation-content-validation-error-code";
import { AccommodationContentValidationError } from "./accommodation-content-validation-error";
import { AccommodationContentValidationResult } from "./accommodation-content-validation-result";

const CONTENT_LOCALES = new Set<string>(Object.values(AccommodationContentLocale));

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isValidTimestamp(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function isValidLocale(value: unknown): value is AccommodationContentLocale {
  return typeof value === "string" && CONTENT_LOCALES.has(value);
}

function createError(
  code: AccommodationContentValidationErrorCode,
  field: string,
  message: string,
): AccommodationContentValidationError {
  return Object.freeze({ code, field, message });
}

export class AccommodationContentValidator {
  public validate(query: AccommodationContentQuery): AccommodationContentValidationResult {
    const errors: AccommodationContentValidationError[] = [];
    const { identifier, context } = query;

    if (identifier === undefined || identifier === null || identifier === "") {
      errors.push(
        createError(
          AccommodationContentValidationErrorCode.MISSING_IDENTIFIER,
          "identifier",
          "Identifier is required.",
        ),
      );
    } else if (typeof identifier !== "string" || identifier.trim().length === 0) {
      errors.push(
        createError(
          AccommodationContentValidationErrorCode.INVALID_IDENTIFIER,
          "identifier",
          "Identifier is invalid.",
        ),
      );
    }

    if (isBlank(context.requestId)) {
      errors.push(
        createError(
          AccommodationContentValidationErrorCode.MISSING_REQUEST_ID,
          "context.requestId",
          "Request ID is required.",
        ),
      );
    }

    if (isBlank(context.source as AccommodationContentSource)) {
      errors.push(
        createError(
          AccommodationContentValidationErrorCode.MISSING_SOURCE,
          "context.source",
          "Source is required.",
        ),
      );
    }

    if (!isValidTimestamp(context.timestamp)) {
      errors.push(
        createError(
          AccommodationContentValidationErrorCode.MISSING_TIMESTAMP,
          "context.timestamp",
          "Timestamp is required.",
        ),
      );
    }

    if (!isValidLocale(context.locale)) {
      errors.push(
        createError(
          AccommodationContentValidationErrorCode.INVALID_LOCALE,
          "context.locale",
          "Locale is invalid.",
        ),
      );
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }
}