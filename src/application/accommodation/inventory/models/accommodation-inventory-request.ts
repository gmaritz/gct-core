import { AccommodationInventoryContext } from "./accommodation-inventory-context";
import { AccommodationInventoryIdentifier } from "./accommodation-inventory-identifier";

export interface AccommodationInventoryRequest {
  readonly identifier: AccommodationInventoryIdentifier;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly adults: number;
  readonly children: number;
  readonly rooms: number;
  readonly context: AccommodationInventoryContext;
}