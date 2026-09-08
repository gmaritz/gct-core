import { CustomerResolutionService } from "../../../customers";
import { ReservationService } from "../../../reservations";
import { AccommodationBookingOrchestrationService } from "../../../reservations/service/accommodation-booking-orchestration";
import { ReservationReviewResult } from "./reservation-review-service";
export interface CustomerJourneyReservationResult {
    readonly successful: boolean;
    readonly errors: ReadonlyArray<string>;
}
export declare class CustomerJourneyReservationService {
    private readonly customerResolutionService;
    private readonly reservationService;
    private readonly bookingOrchestration?;
    constructor(customerResolutionService: CustomerResolutionService, reservationService: ReservationService, bookingOrchestration?: AccommodationBookingOrchestrationService | undefined);
    create(review: ReservationReviewResult): Promise<CustomerJourneyReservationResult>;
}
//# sourceMappingURL=customer-journey-reservation-service.d.ts.map