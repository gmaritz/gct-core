import { Accommodation } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";

export interface AccommodationDetailsResult {
  readonly accommodation: Accommodation;
  readonly metadata: AccommodationResultMetadata;
}
