import { ReservationStatus } from "../../aggregate";

export interface BookingIntegrationResultMetadata {
  readonly generatedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly operation: string;
}

export interface BookingIntegrationResult {
  readonly successful: boolean;
  readonly providerIdentifier: string;
  readonly providerBookingReference: string | null;
  readonly reservationStatus: ReservationStatus;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: BookingIntegrationResultMetadata;
}

export function createBookingIntegrationResult(input: {
  readonly successful: boolean;
  readonly providerIdentifier: string;
  readonly providerBookingReference?: string | null;
  readonly reservationStatus: ReservationStatus;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: BookingIntegrationResultMetadata;
}): BookingIntegrationResult {
  return Object.freeze({
    successful: input.successful,
    providerIdentifier: input.providerIdentifier,
    providerBookingReference: input.providerBookingReference ?? null,
    reservationStatus: input.reservationStatus,
    errors: Object.freeze([...(input.errors ?? [])]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      generatedAt: new Date(input.metadata.generatedAt.getTime()),
      version: input.metadata.version,
      requestId: input.metadata.requestId,
      correlationId: input.metadata.correlationId,
      operation: input.metadata.operation,
    }),
  });
}
