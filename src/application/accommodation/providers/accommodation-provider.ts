import { ProviderCapabilitySet } from "../capabilities";

export interface AccommodationProvider {
  readonly providerId: string;
  readonly capabilities: ProviderCapabilitySet;
  search(): Promise<void>;
}
