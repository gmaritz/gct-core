import { ProviderFeature } from "./provider-feature";

export interface ProviderFeatureSet {
  readonly features: ReadonlyArray<ProviderFeature>;
}
