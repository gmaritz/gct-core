"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importHotelCatalogue = importHotelCatalogue;
exports.readHotelCatalogueWorkbook = readHotelCatalogueWorkbook;
const hotel_catalogue_entry_1 = require("./hotel-catalogue-entry");
const XLSX = __importStar(require("xlsx"));
async function importHotelCatalogue(rows, repository) {
    const seen = new Set();
    const rejected = [];
    const entries = [];
    rows.forEach((row, index) => {
        try {
            const hotelCode = String(row.hotelCode ?? "").trim();
            if (seen.has(hotelCode))
                throw new Error(`Duplicate hotel code: ${hotelCode}`);
            seen.add(hotelCode);
            entries.push((0, hotel_catalogue_entry_1.createHotelCatalogueEntry)({
                hotelCode,
                starGrading: Number(row.starGrading),
                destinationCode: row.destinationCode ?? "",
                zoneCode: String(row.zoneCode ?? ""),
                zoneName: row.zoneName ?? "",
                active: true,
            }));
        }
        catch (error) {
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
        if (outcome === "inserted")
            inserted += 1;
        if (outcome === "updated")
            updated += 1;
        if (outcome === "unchanged")
            unchanged += 1;
    }
    const deactivated = await repository.deactivateMissing(entries.map((entry) => entry.hotelCode));
    return { inserted, updated, unchanged, rejected: Object.freeze([]), deactivated };
}
function normalizedHeaders(row) {
    const headers = row.map((value) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
}
function destinationFromTitleRow(row) {
    const title = String(row[0] ?? "").trim();
    const match = title.match(/^HOTELBEDS DESTINATION CODE:\s*(\S+)$/i);
    return match?.[1]?.trim();
}
function rowHasHeaders(row) {
    const headers = normalizedHeaders(row);
    return headers.HOTEL === "HOTEL" && headers.CODE === "CODE";
}
function rowFromCells(row, headers, destinationCode) {
    const headerNames = headers.map((value) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, ""));
    const cells = Object.fromEntries(headerNames.map((header, index) => [header, row[index]]));
    return {
        hotelName: String(cells.HOTEL ?? ""),
        hotelCode: cells.CODE,
        starGrading: cells.STARGRADING,
        destinationCode,
        zoneCode: cells.ZONE,
        zoneName: String(cells.ZONENAME ?? ""),
    };
}
function readHotelCatalogueWorkbook(buffer, destinationCode) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    return Object.freeze(workbook.SheetNames.flatMap((sheetName) => {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
        const headerIndex = rows.findIndex(rowHasHeaders);
        if (headerIndex < 0)
            return [];
        const headers = rows[headerIndex] ?? [];
        const sheetDestinationCode = rows
            .slice(0, headerIndex)
            .map(destinationFromTitleRow)
            .find((code) => Boolean(code)) ?? destinationCode;
        return rows.slice(headerIndex + 1).filter((row) => row.some((cell) => String(cell).trim().length > 0)).map((sourceRow) => {
            return rowFromCells(sourceRow, headers, sheetDestinationCode);
        });
    }));
}
//# sourceMappingURL=hotel-catalogue-import.js.map