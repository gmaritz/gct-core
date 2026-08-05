import { AccommodationProviderCapabilityType, ProviderCapabilitySet, ProviderFeature } from "../capabilities";
import { AccommodationProvider } from "../providers";
export interface ProviderRegistry {
    register(provider: AccommodationProvider): void;
    unregister(providerId: string): void;
    resolve(providerId: string): AccommodationProvider | undefined;
    resolveAll(): ReadonlyArray<AccommodationProvider>;
    findProviders(capability: AccommodationProviderCapabilityType): ReadonlyArray<AccommodationProvider>;
    capabilities(providerId: string): ProviderCapabilitySet | undefined;
    features(providerId: string): ReadonlyArray<ProviderFeature>;
    supports(providerId: string, capability: AccommodationProviderCapabilityType): boolean;
}
export declare class InMemoryProviderRegistry implements ProviderRegistry {
    private readonly providersById;
    register(provider: AccommodationProvider): void;
    unregister(providerId: string): void;
    resolve(providerId: string): AccommodationProvider | undefined;
    resolveAll(): ReadonlyArray<AccommodationProvider>;
    findProviders(capability: AccommodationProviderCapabilityType): ReadonlyArray<AccommodationProvider>;
    capabilities(providerId: string): ProviderCapabilitySet | undefined;
    features(providerId: string): ReadonlyArray<ProviderFeature>;
    supports(providerId: string, capability: AccommodationProviderCapabilityType): boolean;
}
//# sourceMappingURL=provider-registry.d.ts.map