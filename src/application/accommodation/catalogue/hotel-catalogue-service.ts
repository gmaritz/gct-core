import { AccommodationSearchCriteria } from "../discovery/accommodation-search-criteria";
import { HotelCatalogueEntry } from "./hotel-catalogue-entry";
import { HotelCatalogueRepository } from "./hotel-catalogue-repository";

export type HotelCatalogueSelectionMode = "EXPLICIT" | "ATTRIBUTE";

export interface HotelCatalogueSelection {
  readonly hotelCodes: ReadonlyArray<string>;
  readonly selectionMode: HotelCatalogueSelectionMode;
}

export class HotelCatalogueService {
  public constructor(private readonly repository: HotelCatalogueRepository) {}

  public async select(criteria: Pick<AccommodationSearchCriteria, "hotelCodes" | "destinationCode" | "zoneCode" | "starGrading">): Promise<HotelCatalogueSelection> {
    const explicitCodes = (criteria.hotelCodes ?? []).map((code) => code.trim()).filter(Boolean);
    const entries = await this.repository.findActive(
      explicitCodes.length > 0
        ? { hotelCodes: explicitCodes, destinationCode: criteria.destinationCode, zoneCode: criteria.zoneCode, starGrading: criteria.starGrading }
        : { destinationCode: criteria.destinationCode, zoneCode: criteria.zoneCode, starGrading: criteria.starGrading },
    );

    return Object.freeze({
      hotelCodes: Object.freeze(entries.map((entry) => entry.hotelCode)),
      selectionMode: explicitCodes.length > 0 ? "EXPLICIT" : "ATTRIBUTE",
    });
  }

  public async find(criteria: Pick<AccommodationSearchCriteria, "hotelCodes" | "destinationCode" | "zoneCode" | "starGrading">): Promise<ReadonlyArray<HotelCatalogueEntry>> {
    const selection = await this.select(criteria);
    return this.repository.findActive({ hotelCodes: selection.hotelCodes });
  }
}