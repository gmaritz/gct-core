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
export declare function createBookingIntegrationContext(request: BookingIntegrationRequest): BookingIntegrationContext;
//# sourceMappingURL=booking-integration-context.d.ts.map