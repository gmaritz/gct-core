import { ApplicationService } from "../../../application-service";
import { ProviderRegistry } from "../../registry";
import { AccommodationProvider } from "../../providers";
import { AccommodationBookingRequest, AccommodationBookingResult } from "../models";
export interface AccommodationBookingProvider extends AccommodationProvider {
    book(request: AccommodationBookingRequest): Promise<AccommodationBookingResult>;
}
export declare class AccommodationBookingService implements ApplicationService<AccommodationBookingRequest, AccommodationBookingResult> {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    execute(request: AccommodationBookingRequest): Promise<AccommodationBookingResult>;
}
//# sourceMappingURL=accommodation-booking-service.d.ts.map