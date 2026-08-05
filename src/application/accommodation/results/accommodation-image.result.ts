import { AccommodationImage } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";

export interface AccommodationImageResult {
  readonly accommodationId: string;
  readonly images: ReadonlyArray<AccommodationImage>;
  readonly metadata: AccommodationResultMetadata;
}
