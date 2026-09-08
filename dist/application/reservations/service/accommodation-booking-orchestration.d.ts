import { ApplicationService } from "../../application-service";
import { AccommodationBookingResult, AccommodationBookingService } from "../../accommodation/booking";
import { AccommodationRateRevalidationResult, AccommodationRateRevalidationService } from "../../accommodation/revalidation";
import { PricingEngine, PricingEngineRequest } from "../../pricing";
import { Reservation } from "../aggregate";
import { ReservationService, ReservationServiceRequest } from "./index";
import { ReservationPersistenceContext, ReservationRepository } from "../repository";
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
    private readonly reservationRepository?;
    constructor(pricingEngine: PricingEngine, reservationService: ReservationService, revalidationService: AccommodationRateRevalidationService, bookingService: AccommodationBookingService, reservationRepository?: ReservationRepository | undefined);
    fulfilReservation(reservation: Reservation, handoff: AccommodationReservationHandoffInput, persistenceContext: ReservationPersistenceContext): Promise<AccommodationBookingOrchestrationResult>;
    execute(request: AccommodationBookingOrchestrationRequest): Promise<AccommodationBookingOrchestrationResult>;
    private bookAccommodation;
}
//# sourceMappingURL=accommodation-booking-orchestration.d.ts.map