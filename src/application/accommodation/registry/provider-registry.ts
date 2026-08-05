import {
  AccommodationProviderCapabilityType,
  ProviderCapabilitySet,
  ProviderFeature,
} from "../capabilities";
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

export class InMemoryProviderRegistry implements ProviderRegistry {
  private readonly providersById = new Map<string, AccommodationProvider>();

  public register(provider: AccommodationProvider): void {
    if (this.providersById.has(provider.providerId)) {
      throw new Error(`Provider already registered: ${provider.providerId}`);
    }

    this.providersById.set(provider.providerId, provider);
  }

  public unregister(providerId: string): void {
    this.providersById.delete(providerId);
  }

  public resolve(providerId: string): AccommodationProvider | undefined {
    return this.providersById.get(providerId);
  }

  public resolveAll(): ReadonlyArray<AccommodationProvider> {
    return Object.freeze(Array.from(this.providersById.values()));
  }

  public findProviders(capability: AccommodationProviderCapabilityType): ReadonlyArray<AccommodationProvider> {
    return Object.freeze(
      this.resolveAll().filter((provider) =>
        provider.capabilities.capabilities.some(
          (providerCapability) => providerCapability.type === capability,
        ),
      ),
    );
  }

  public capabilities(providerId: string): ProviderCapabilitySet | undefined {
    return this.resolve(providerId)?.capabilities;
  }

  public features(providerId: string): ReadonlyArray<ProviderFeature> {
    const providerCapabilitySet = this.capabilities(providerId);
    if (!providerCapabilitySet) {
      return Object.freeze([]);
    }

    return Object.freeze(
      providerCapabilitySet.capabilities.flatMap(
        (providerCapability) => providerCapability.features.features,
      ),
    );
  }

  public supports(providerId: string, capability: AccommodationProviderCapabilityType): boolean {
    const provider = this.resolve(providerId);
    if (!provider) {
      return false;
    }

    return provider.capabilities.capabilities.some(
      (providerCapability) => providerCapability.type === capability,
    );
  }
}
