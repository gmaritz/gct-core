import { ApplicationService } from "../../application-service";
import { AccommodationBookingResult, AccommodationBookingService } from "../../accommodation/booking";
import { AccommodationRateRevalidationResult, AccommodationRateRevalidationService } from "../../accommodation/revalidation";
import { PricingEngine, PricingEngineRequest } from "../../pricing";
import { Reservation } from "../aggregate";
import { ReservationService, ReservationServiceRequest } from "./index";
import { AccommodationReservationHandoffInput } from "../integration";
export interface AccommodationBookingOrchestrationRequest {
    readonly pricing: PricingEngineRequest;
    readonly reservation: Omit<ReservationServiceRequest, "snapshots"> & {
        readonly snapshots: Omit<ReservationServiceRequest["snapshots"], "accommodationSnapshots" | "pricingSnapshot">;
    };
    readonly handoff: AccommodationReservationHandoffInput;
}
export interface AccommodationBookingOrchestrationResult {
    readonly successful: boolean;
    readonly reservation: Reservation | null;
    readonly pricing: PricingEngineRequest["pricingRequest"];
    readonly revalidations: ReadonlyArray<AccommodationRateRevalidationResult>;
    readonly bookings: ReadonlyArray<AccommodationBookingResult>;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
}
export declare class AccommodationBookingOrchestrationService implements ApplicationService<AccommodationBookingOrchestrationRequest, AccommodationBookingOrchestrationResult> {
    private readonly pricingEngine;
    private readonly reservationService;
    private readonly revalidationService;
    private readonly bookingService;
    constructor(pricingEngine: PricingEngine, reservationService: ReservationService, revalidationService: AccommodationRateRevalidationService, bookingService: AccommodationBookingService);
    execute(request: AccommodationBookingOrchestrationRequest): Promise<AccommodationBookingOrchestrationResult>;
}
//# sourceMappingURL=accommodation-booking-orchestration.d.ts.map