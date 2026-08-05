import { ProviderRegistry } from "../registry";

export interface AccommodationEngine {
  search(): Promise<void>;
}

export class DefaultAccommodationEngine implements AccommodationEngine {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async search(): Promise<void> {
    // APP-002.1 scaffold only: search orchestration will be implemented in later milestones.
    void this.providerRegistry;
  }
}
