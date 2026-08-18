import { HotelCatalogueEntry } from "./hotel-catalogue-entry";

export interface HotelCatalogueFilter {
  readonly hotelCodes?: ReadonlyArray<string>;
  readonly destinationCode?: string;
  readonly zoneCode?: string;
  readonly starGrading?: number;
}

export interface HotelCatalogueRepository {
  findActive(filter?: HotelCatalogueFilter): Promise<ReadonlyArray<HotelCatalogueEntry>>;
  upsert(entry: HotelCatalogueEntry): Promise<"inserted" | "updated" | "unchanged">;
  deactivateMissing(hotelCodes: ReadonlyArray<string>): Promise<number>;
}

export class InMemoryHotelCatalogueRepository implements HotelCatalogueRepository {
  private readonly entries = new Map<string, HotelCatalogueEntry>();

  public async findActive(filter: HotelCatalogueFilter = {}): Promise<ReadonlyArray<HotelCatalogueEntry>> {
    const codes = filter.hotelCodes ? new Set(filter.hotelCodes.map((code) => code.trim())) : undefined;
    return Object.freeze(
      [...this.entries.values()]
        .filter((entry) => entry.active)
        .filter((entry) => !codes || codes.has(entry.hotelCode))
        .filter((entry) => !filter.destinationCode || entry.destinationCode === filter.destinationCode.trim())
        .filter((entry) => !filter.zoneCode || entry.zoneCode === filter.zoneCode.trim())
        .filter((entry) => filter.starGrading === undefined || entry.starGrading === filter.starGrading)
        .sort((left, right) => left.zoneName.localeCompare(right.zoneName) || left.hotelCode.localeCompare(right.hotelCode)),
    );
  }

  public async upsert(entry: HotelCatalogueEntry): Promise<"inserted" | "updated" | "unchanged"> {
    const previous = this.entries.get(entry.hotelCode);
    this.entries.set(entry.hotelCode, Object.freeze({ ...entry }));
    if (!previous) return "inserted";
    return JSON.stringify(previous) === JSON.stringify(entry) ? "unchanged" : "updated";
  }

  public async deactivateMissing(hotelCodes: ReadonlyArray<string>): Promise<number> {
    const retained = new Set(hotelCodes.map((code) => code.trim()));
    let count = 0;
    for (const [code, entry] of this.entries) {
      if (!retained.has(code) && entry.active) {
        this.entries.set(code, Object.freeze({ ...entry, active: false }));
        count += 1;
      }
    }
    return count;
  }
}