import { ProviderRegistry } from "../registry";
export interface AccommodationEngine {
    search(): Promise<void>;
}
export declare class DefaultAccommodationEngine implements AccommodationEngine {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    search(): Promise<void>;
}
//# sourceMappingURL=accommodation-engine.d.ts.map