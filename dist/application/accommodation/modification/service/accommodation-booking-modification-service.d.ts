import { ApplicationService } from "../../../application-service";
import { AccommodationProvider } from "../../providers";
import { ProviderRegistry } from "../../registry";
import { AccommodationBookingModificationRequest, AccommodationBookingModificationResult } from "../models";
export interface AccommodationBookingModificationProvider extends AccommodationProvider {
    modifyBooking(request: AccommodationBookingModificationRequest): Promise<AccommodationBookingModificationResult>;
}
export declare class AccommodationBookingModificationService implements ApplicationService<AccommodationBookingModificationRequest, AccommodationBookingModificationResult> {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    execute(request: AccommodationBookingModificationRequest): Promise<AccommodationBookingModificationResult>;
}
//# sourceMappingURL=accommodation-booking-modification-service.d.ts.map