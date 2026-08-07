import { ApplicationService } from "../../application-service";
import { ReservationStatus } from "../aggregate";
import { BookingGateway, BookingGatewayResponse } from "./booking-gateway";
import {
  BookingIntegrationContext,
  BookingIntegrationRequest,
  BookingIntegrationResult,
  createBookingIntegrationContext,
  createBookingIntegrationResult,
} from "./models";

function resolveOperation(
  gateway: BookingGateway,
  context: BookingIntegrationContext,
): Promise<BookingGatewayResponse> {
  switch (context.bookingRequest.operation) {
    case "CREATE":
      return gateway.createBooking(context);
    case "AMEND":
      return gateway.amendBooking(context);
    case "CANCEL":
      return gateway.cancelBooking(context);
    case "STATUS":
      return gateway.retrieveBookingStatus(context);
    default:
      return Promise.resolve({
        successful: false,
        providerIdentifier: context.providerSelection.providerId,
        reservationStatus: context.reservation.status,
        errors: ["Unsupported booking operation."],
      });
  }
}

function toReservationStatus(
  response: BookingGatewayResponse,
  fallbackStatus: ReservationStatus,
): ReservationStatus {
  return response.reservationStatus ?? fallbackStatus;
}

export class BookingIntegrationOrchestrator
  implements ApplicationService<BookingIntegrationRequest, BookingIntegrationResult>
{
  public constructor(private readonly gateway: BookingGateway) {}

  public async execute(request: BookingIntegrationRequest): Promise<BookingIntegrationResult> {
    const context = createBookingIntegrationContext(request);
    const response = await resolveOperation(this.gateway, context);

    return createBookingIntegrationResult({
      successful: response.successful,
      providerIdentifier: response.providerIdentifier || context.providerSelection.providerId,
      providerBookingReference: response.providerBookingReference,
      reservationStatus: toReservationStatus(response, context.reservation.status),
      errors: response.errors,
      warnings: response.warnings,
      metadata: {
        generatedAt: new Date(),
        version: "1.0.0",
        requestId: context.correlation.requestId,
        correlationId: context.correlation.correlationId,
        operation: context.bookingRequest.operation,
      },
    });
  }
}
