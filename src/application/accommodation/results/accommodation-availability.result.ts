import { Accommodation } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";

export type AccommodationAvailabilityResult =
  | {
      readonly kind: "ACCOMMODATION";
      readonly accommodation: Accommodation;
      readonly available: boolean;
      readonly metadata: AccommodationResultMetadata;
    }
  | {
      readonly kind: "NO_AVAILABILITY";
      readonly accommodation?: never;
      readonly available: false;
      readonly metadata: AccommodationResultMetadata;
    };
