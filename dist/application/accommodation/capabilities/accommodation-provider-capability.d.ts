import { AccommodationProviderCapabilityId } from "./accommodation-provider-capability-id";
import { AccommodationProviderCapabilityType } from "./accommodation-provider-capability-type";
import { ProviderFeatureSet } from "./provider-feature-set";
export interface AccommodationProviderCapability {
    readonly identifier: AccommodationProviderCapabilityId;
    readonly type: AccommodationProviderCapabilityType;
    readonly name: string;
    readonly description: string;
    readonly version: string;
    readonly enabled: boolean;
    readonly deprecated: boolean;
    readonly experimental: boolean;
    readonly features: ProviderFeatureSet;
}
//# sourceMappingURL=accommodation-provider-capability.d.ts.map