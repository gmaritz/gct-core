import {
  createHotelbedsIntegrationError,
  HotelbedsIntegrationError,
} from "./hotelbeds-integration-error";
import { HotelbedsAvailabilityRequest } from "./hotelbeds-availability-request";

export interface HotelbedsAvailabilitySupplierError {
  readonly code?: string;
  readonly message?: string;
  readonly payload: unknown;
}

export interface HotelbedsAvailabilityTransportFailure {
  readonly kind: string;
  readonly message: string;
  readonly providerCode?: string;
}

export interface HotelbedsAvailabilityRawResponse {
  readonly requestIndex: number;
  readonly request: HotelbedsAvailabilityRequest;
  readonly success: boolean;
  readonly retryable: boolean;
  readonly attempts: number;
  readonly httpStatus?: number;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly supplierError?: HotelbedsAvailabilitySupplierError;
  readonly transportFailure?: HotelbedsAvailabilityTransportFailure;
  readonly errors: ReadonlyArray<HotelbedsIntegrationError>;
}

export interface HotelbedsAvailabilityExecutionResult {
  readonly provider: "hotelbeds";
  readonly operation: "availability";
  readonly completedAt: Date;
  readonly responses: ReadonlyArray<HotelbedsAvailabilityRawResponse>;
}

function freezeRequest(request: HotelbedsAvailabilityRequest): HotelbedsAvailabilityRequest {
  return Object.freeze({
    ...request,
    body: request.body
      ? Object.freeze({
          ...request.body,
          stay: Object.freeze({ ...request.body.stay }),
          occupancies: Object.freeze(
            request.body.occupancies.map((occupancy) =>
              Object.freeze({
                ...occupancy,
                paxes: Object.freeze(occupancy.paxes.map((pax) => Object.freeze({ ...pax }))),
              }),
            ),
          ),
          hotels: Object.freeze({ hotel: Object.freeze([...request.body.hotels.hotel]) }),
        })
      : request.body,
  });
}

function freezeSupplierError(
  supplierError: HotelbedsAvailabilitySupplierError | undefined,
): HotelbedsAvailabilitySupplierError | undefined {
  if (!supplierError) {
    return undefined;
  }

  return Object.freeze({
    code: supplierError.code,
    message: supplierError.message,
    payload: supplierError.payload,
  });
}

export function createHotelbedsAvailabilityExecutionResult(
  result: HotelbedsAvailabilityExecutionResult,
): HotelbedsAvailabilityExecutionResult {
  return Object.freeze({
    provider: "hotelbeds",
    operation: "availability",
    completedAt: new Date(result.completedAt.getTime()),
    responses: Object.freeze(
      result.responses.map((response) =>
        Object.freeze({
          requestIndex: response.requestIndex,
          request: freezeRequest(response.request),
          success: response.success,
          retryable: response.retryable,
          attempts: response.attempts,
          httpStatus: response.httpStatus,
          headers: response.headers ? Object.freeze({ ...response.headers }) : undefined,
          body: response.body,
          supplierError: freezeSupplierError(response.supplierError),
          transportFailure: response.transportFailure
            ? Object.freeze({ ...response.transportFailure })
            : undefined,
          errors: Object.freeze((response.errors ?? []).map(createHotelbedsIntegrationError)),
        }),
      ),
    ),
  });
}
