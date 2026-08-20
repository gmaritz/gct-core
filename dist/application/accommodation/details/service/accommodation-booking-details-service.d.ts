import { ApplicationService } from "../../../application-service";
import { AccommodationProvider } from "../../providers";
import { ProviderRegistry } from "../../registry";
import { AccommodationBookingDetailsRequest, AccommodationBookingDetailsResult } from "../models";
export interface AccommodationBookingDetailsProvider extends AccommodationProvider {
    getBookingDetails(request: AccommodationBookingDetailsRequest): Promise<AccommodationBookingDetailsResult>;
}
export declare class AccommodationBookingDetailsService implements ApplicationService<AccommodationBookingDetailsRequest, AccommodationBookingDetailsResult> {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    execute(request: AccommodationBookingDetailsRequest): Promise<AccommodationBookingDetailsResult>;
}
//# sourceMappingURL=accommodation-booking-details-service.d.ts.map