import { AccommodationSearchCriteria } from "../discovery/accommodation-search-criteria";
import { isValidExplicitHotelCode } from "../discovery/validation/hotel-code-validation";
import { HotelCatalogueEntry } from "./hotel-catalogue-entry";
import { HotelCatalogueRepository } from "./hotel-catalogue-repository";

export type HotelCatalogueSelectionMode = "EXPLICIT" | "ATTRIBUTE";

export interface HotelCatalogueSelection {
  readonly hotelCodes: ReadonlyArray<string>;
  readonly selectionMode: HotelCatalogueSelectionMode;
}

type HotelSelectionCriteria = Pick<AccommodationSearchCriteria, "hotelCodes" | "destinationCode" | "zoneCode" | "starGrading">;

interface ResolvedCandidates {
  readonly selectionMode: HotelCatalogueSelectionMode;
  readonly entries: ReadonlyArray<HotelCatalogueEntry>;
}

function normalizeOptionalCode(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeExplicitCodes(codes: ReadonlyArray<string> | undefined): ReadonlyArray<string> {
  if (!codes || codes.length === 0) {
    return Object.freeze([]);
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  codes.forEach((hotelCode, index) => {
    if (!isValidExplicitHotelCode(hotelCode)) {
      throw new Error(`Invalid explicit hotel code at index ${index}.`);
    }

    const code = hotelCode.trim();
    if (!seen.has(code)) {
      seen.add(code);
      normalized.push(code);
    }
  });

  return Object.freeze(normalized);
}

export class HotelCatalogueService {
  public constructor(private readonly repository: HotelCatalogueRepository) {}

  private async resolveEntries(criteria: HotelSelectionCriteria): Promise<ResolvedCandidates> {
    const explicitCodes = normalizeExplicitCodes(criteria.hotelCodes);
    if (explicitCodes.length > 0) {
      const activeEntries = await this.repository.findActive({ hotelCodes: explicitCodes });
      const entriesByCode = new Map(activeEntries.map((entry) => [entry.hotelCode, entry]));
      const orderedEntries = explicitCodes
        .map((hotelCode) => entriesByCode.get(hotelCode))
        .filter((entry): entry is HotelCatalogueEntry => Boolean(entry));

      return Object.freeze({
        selectionMode: "EXPLICIT",
        entries: Object.freeze(orderedEntries),
      });
    }

    const attributeEntries = await this.repository.findActive({
      destinationCode: normalizeOptionalCode(criteria.destinationCode),
      zoneCode: normalizeOptionalCode(criteria.zoneCode),
      starGrading: criteria.starGrading,
    });

    return Object.freeze({
      selectionMode: "ATTRIBUTE",
      entries: Object.freeze(attributeEntries),
    });
  }

  public async select(criteria: HotelSelectionCriteria): Promise<HotelCatalogueSelection> {
    const resolved = await this.resolveEntries(criteria);

    return Object.freeze({
      hotelCodes: Object.freeze(resolved.entries.map((entry) => entry.hotelCode)),
      selectionMode: resolved.selectionMode,
    });
  }

  public async find(criteria: HotelSelectionCriteria): Promise<ReadonlyArray<HotelCatalogueEntry>> {
    const resolved = await this.resolveEntries(criteria);
    return Object.freeze(resolved.entries);
  }
}