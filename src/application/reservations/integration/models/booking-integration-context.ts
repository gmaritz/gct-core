import { Reservation } from "../../aggregate";

export type BookingOperation = "CREATE" | "AMEND" | "CANCEL" | "STATUS";

export interface BookingRequest {
  readonly operation: BookingOperation;
  readonly reservationId: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export interface BookingProviderSelection {
  readonly providerId: string;
  readonly channel?: string;
}

export interface BookingCorrelationIdentifiers {
  readonly requestId: string;
  readonly correlationId: string;
  readonly traceId?: string;
}

export interface BookingIntegrationContextMetadata {
  readonly createdAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface BookingIntegrationRequest {
  readonly reservation: Reservation;
  readonly bookingRequest: BookingRequest;
  readonly providerSelection: BookingProviderSelection;
  readonly correlation: BookingCorrelationIdentifiers;
  readonly metadata?: {
    readonly source?: string;
  };
}

export interface BookingIntegrationContext {
  readonly reservation: Reservation;
  readonly bookingRequest: BookingRequest;
  readonly providerSelection: BookingProviderSelection;
  readonly correlation: BookingCorrelationIdentifiers;
  readonly metadata: BookingIntegrationContextMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeBookingRequest(request: BookingRequest): BookingRequest {
  return Object.freeze({
    operation: request.operation,
    reservationId: request.reservationId,
    payload: request.payload ? Object.freeze({ ...request.payload }) : undefined,
  });
}

function freezeProviderSelection(selection: BookingProviderSelection): BookingProviderSelection {
  return Object.freeze({
    providerId: selection.providerId,
    channel: selection.channel,
  });
}

function freezeCorrelation(correlation: BookingCorrelationIdentifiers): BookingCorrelationIdentifiers {
  return Object.freeze({
    requestId: correlation.requestId,
    correlationId: correlation.correlationId,
    traceId: correlation.traceId,
  });
}

export function createBookingIntegrationContext(
  request: BookingIntegrationRequest,
): BookingIntegrationContext {
  return Object.freeze({
    reservation: request.reservation,
    bookingRequest: freezeBookingRequest(request.bookingRequest),
    providerSelection: freezeProviderSelection(request.providerSelection),
    correlation: freezeCorrelation(request.correlation),
    metadata: Object.freeze({
      createdAt: cloneDate(new Date()),
      version: "1.0.0",
      source: request.metadata?.source ?? "APP-004.8",
    }),
  });
}
