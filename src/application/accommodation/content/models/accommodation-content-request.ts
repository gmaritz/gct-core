import { AccommodationContentContext } from "./accommodation-content-context";
import { AccommodationContentIdentifier } from "./accommodation-content-identifier";

export interface AccommodationContentRequest {
  readonly identifier: AccommodationContentIdentifier;
  readonly context: AccommodationContentContext;
}