import { CustomerResolutionService } from "../../../customers";
import { ReservationService } from "../../../reservations";
import { ReservationReviewResult } from "./reservation-review-service";
export interface CustomerJourneyReservationResult {
    readonly successful: boolean;
    readonly errors: ReadonlyArray<string>;
}
export declare class CustomerJourneyReservationService {
    private readonly customerResolutionService;
    private readonly reservationService;
    constructor(customerResolutionService: CustomerResolutionService, reservationService: ReservationService);
    create(review: ReservationReviewResult): Promise<CustomerJourneyReservationResult>;
}
//# sourceMappingURL=customer-journey-reservation-service.d.ts.map