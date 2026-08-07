import { ReservationStatus } from "../aggregate";
import { BookingIntegrationContext } from "./models";
export interface BookingGatewayResponse {
    readonly successful: boolean;
    readonly providerIdentifier: string;
    readonly providerBookingReference?: string;
    readonly reservationStatus?: ReservationStatus;
    readonly errors?: ReadonlyArray<string>;
    readonly warnings?: ReadonlyArray<string>;
}
export interface BookingGateway {
    createBooking(context: BookingIntegrationContext): Promise<BookingGatewayResponse>;
    amendBooking(context: BookingIntegrationContext): Promise<BookingGatewayResponse>;
    cancelBooking(context: BookingIntegrationContext): Promise<BookingGatewayResponse>;
    retrieveBookingStatus(context: BookingIntegrationContext): Promise<BookingGatewayResponse>;
}
//# sourceMappingURL=booking-gateway.d.ts.map