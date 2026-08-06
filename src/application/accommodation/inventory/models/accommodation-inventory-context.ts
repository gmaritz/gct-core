import { AccommodationInventorySource } from "./accommodation-inventory-source";

export interface AccommodationInventoryContext {
  readonly requestId: string;
  readonly source: AccommodationInventorySource;
  readonly timestamp: Date;
}