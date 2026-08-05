"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProviderRegistry = void 0;
class InMemoryProviderRegistry {
    constructor() {
        this.providersById = new Map();
    }
    register(provider) {
        if (this.providersById.has(provider.providerId)) {
            throw new Error(`Provider already registered: ${provider.providerId}`);
        }
        this.providersById.set(provider.providerId, provider);
    }
    unregister(providerId) {
        this.providersById.delete(providerId);
    }
    resolve(providerId) {
        return this.providersById.get(providerId);
    }
    resolveAll() {
        return Object.freeze(Array.from(this.providersById.values()));
    }
    findProviders(capability) {
        return Object.freeze(this.resolveAll().filter((provider) => provider.capabilities.capabilities.some((providerCapability) => providerCapability.type === capability)));
    }
    capabilities(providerId) {
        return this.resolve(providerId)?.capabilities;
    }
    features(providerId) {
        const providerCapabilitySet = this.capabilities(providerId);
        if (!providerCapabilitySet) {
            return Object.freeze([]);
        }
        return Object.freeze(providerCapabilitySet.capabilities.flatMap((providerCapability) => providerCapability.features.features));
    }
    supports(providerId, capability) {
        const provider = this.resolve(providerId);
        if (!provider) {
            return false;
        }
        return provider.capabilities.capabilities.some((providerCapability) => providerCapability.type === capability);
    }
}
exports.InMemoryProviderRegistry = InMemoryProviderRegistry;
//# sourceMappingURL=provider-registry.js.map