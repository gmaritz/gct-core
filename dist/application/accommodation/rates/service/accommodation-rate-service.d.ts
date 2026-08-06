import { ApplicationService } from "../../../application-service";
import { ProviderRegistry } from "../../registry";
import { AccommodationRateQuery, AccommodationRateResult } from "../models";
import { AccommodationRateValidator } from "../validation";
export declare class AccommodationRateService implements ApplicationService<AccommodationRateQuery, AccommodationRateResult> {
    private readonly providerRegistry;
    private readonly validator;
    constructor(providerRegistry: ProviderRegistry, validator?: AccommodationRateValidator);
    execute(query: AccommodationRateQuery): Promise<AccommodationRateResult>;
}
//# sourceMappingURL=accommodation-rate-service.d.ts.map