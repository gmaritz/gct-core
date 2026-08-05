import { AccommodationProviderCapability } from "./accommodation-provider-capability";

export interface ProviderCapabilitySet {
  readonly capabilities: ReadonlyArray<AccommodationProviderCapability>;
}
