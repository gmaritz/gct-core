import { Accommodation } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";

export interface AccommodationContentResult {
  readonly accommodation: Accommodation;
  readonly metadata: AccommodationResultMetadata;
}
