import { createHotelCatalogueEntry, HotelCatalogueEntry } from "./hotel-catalogue-entry";
import { HotelCatalogueRepository } from "./hotel-catalogue-repository";
import * as XLSX from "xlsx";

export interface HotelCatalogueSourceRow {
  readonly hotelName?: string;
  readonly hotelCode?: string | number;
  readonly starGrading?: string | number;
  readonly destinationCode?: string;
  readonly zoneCode?: string | number;
  readonly zoneName?: string;
}

export interface HotelCatalogueImportReport {
  readonly inserted: number;
  readonly updated: number;
  readonly unchanged: number;
  readonly rejected: ReadonlyArray<{ readonly row: number; readonly reason: string }>;
  readonly deactivated: number;
}

export async function importHotelCatalogue(
  rows: ReadonlyArray<HotelCatalogueSourceRow>,
  repository: HotelCatalogueRepository,
): Promise<HotelCatalogueImportReport> {
  const seen = new Set<string>();
  const rejected: Array<{ readonly row: number; readonly reason: string }> = [];
  const entries: HotelCatalogueEntry[] = [];
  rows.forEach((row, index) => {
    try {
      const hotelCode = String(row.hotelCode ?? "").trim();
      if (seen.has(hotelCode)) throw new Error(`Duplicate hotel code: ${hotelCode}`);
      seen.add(hotelCode);
      entries.push(createHotelCatalogueEntry({
        hotelCode,
        starGrading: Number(row.starGrading),
        destinationCode: row.destinationCode ?? "",
        zoneCode: String(row.zoneCode ?? ""),
        zoneName: row.zoneName ?? "",
        active: true,
      }));
    } catch (error) {
      rejected.push({ row: index + 1, reason: error instanceof Error ? error.message : "Invalid catalogue row." });
    }
  });

  if (rejected.length > 0) {
    return { inserted: 0, updated: 0, unchanged: 0, rejected: Object.freeze(rejected), deactivated: 0 };
  }

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  for (const entry of entries) {
    const outcome = await repository.upsert(entry);
    if (outcome === "inserted") inserted += 1;
    if (outcome === "updated") updated += 1;
    if (outcome === "unchanged") unchanged += 1;
  }
  const deactivated = await repository.deactivateMissing(entries.map((entry) => entry.hotelCode));
  return { inserted, updated, unchanged, rejected: Object.freeze([]), deactivated };
}

function normalizedHeaders(row: ReadonlyArray<unknown>): Record<string, unknown> {
  const headers = row.map((value) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, ""));
  return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
}

function destinationFromTitleRow(row: ReadonlyArray<unknown>): string | undefined {
  const title = String(row[0] ?? "").trim();
  const match = title.match(/^HOTELBEDS DESTINATION CODE:\s*(\S+)$/i);
  return match?.[1]?.trim();
}

function rowHasHeaders(row: ReadonlyArray<unknown>): boolean {
  const headers = normalizedHeaders(row);
  return headers.HOTEL === "HOTEL" && headers.CODE === "CODE";
}

function rowFromCells(row: ReadonlyArray<unknown>, headers: ReadonlyArray<unknown>, destinationCode: string): HotelCatalogueSourceRow {
  const headerNames = headers.map((value) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, ""));
  const cells = Object.fromEntries(headerNames.map((header, index) => [header, row[index]]));
  return {
    hotelName: String(cells.HOTEL ?? ""),
    hotelCode: cells.CODE as string | number,
    starGrading: cells.STARGRADING as string | number,
    destinationCode,
    zoneCode: cells.ZONE as string | number,
    zoneName: String(cells.ZONENAME ?? ""),
  };
}

export function readHotelCatalogueWorkbook(buffer: Buffer, destinationCode: string): ReadonlyArray<HotelCatalogueSourceRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  return Object.freeze(
    workbook.SheetNames.flatMap((sheetName) => {
      const rows = XLSX.utils.sheet_to_json<ReadonlyArray<unknown>>(workbook.Sheets[sheetName], { header: 1, defval: "" });
      const headerIndex = rows.findIndex(rowHasHeaders);
      if (headerIndex < 0) return [];
      const headers = rows[headerIndex] ?? [];
      const sheetDestinationCode = rows
        .slice(0, headerIndex)
        .map(destinationFromTitleRow)
        .find((code): code is string => Boolean(code)) ?? destinationCode;
      return rows.slice(headerIndex + 1).filter((row) => row.some((cell) => String(cell).trim().length > 0)).map((sourceRow) => {
        return rowFromCells(sourceRow, headers, sheetDestinationCode);
      });
    }),
  );
}