import { ApplicationService } from "../../../application-service";
import { AccommodationProvider } from "../../providers";
import { ProviderRegistry } from "../../registry";
import { AccommodationCancellationRequest, AccommodationCancellationResult } from "../models";
export interface AccommodationCancellationProvider extends AccommodationProvider {
    cancelAccommodation(request: AccommodationCancellationRequest): Promise<AccommodationCancellationResult>;
}
export declare class AccommodationCancellationService implements ApplicationService<AccommodationCancellationRequest, AccommodationCancellationResult> {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    execute(request: AccommodationCancellationRequest): Promise<AccommodationCancellationResult>;
}
//# sourceMappingURL=accommodation-cancellation-service.d.ts.map