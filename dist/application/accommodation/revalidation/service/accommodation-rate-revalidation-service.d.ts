import { ApplicationService } from "../../../application-service";
import { ProviderRegistry } from "../../registry";
import { AccommodationProvider } from "../../providers";
import { AccommodationRateRevalidationRequest, AccommodationRateRevalidationResult } from "../models";
export interface AccommodationRateRevalidationProvider extends AccommodationProvider {
    revalidate(request: AccommodationRateRevalidationRequest): Promise<AccommodationRateRevalidationResult>;
}
export declare class AccommodationRateRevalidationService implements ApplicationService<AccommodationRateRevalidationRequest, AccommodationRateRevalidationResult> {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    execute(request: AccommodationRateRevalidationRequest): Promise<AccommodationRateRevalidationResult>;
}
//# sourceMappingURL=accommodation-rate-revalidation-service.d.ts.map