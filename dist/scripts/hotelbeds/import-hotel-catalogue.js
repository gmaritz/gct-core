"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const catalogue_1 = require("../../application/accommodation/catalogue");
const prisma_1 = require("../../bootstrap/prisma");
const hotel_catalogue_prisma_repository_1 = require("../../infrastructure/persistence/repositories/accommodation/hotel-catalogue-prisma.repository");
const sourceDirectory = (0, node_path_1.join)(process.cwd(), "scripts", "data", "hotel-catalogue");
const sources = [
    "HotelBeds - Cape Town_Winelands_Garden Route Hotel Codes.xlsx",
    "HotelBeds - Safari Hotel Codes.xlsx",
];
function validateRows(rows) {
    const codes = rows.map((row) => String(row.hotelCode ?? "").trim());
    const duplicateCodes = [...new Set(codes.filter((code, index) => code && codes.indexOf(code) !== index))];
    const missingCodes = rows.filter((row) => String(row.hotelCode ?? "").trim().length === 0).length;
    const invalidStarGrading = rows.filter((row) => row.starGrading !== 4 && row.starGrading !== 5).length;
    const destinationCounts = rows.reduce((counts, row) => {
        const destination = row.destinationCode?.trim() || "<missing>";
        counts[destination] = (counts[destination] ?? 0) + 1;
        return counts;
    }, {});
    const missingZoneCodes = rows.filter((row) => String(row.zoneCode ?? "").trim().length === 0).length;
    const missingZoneNames = rows.filter((row) => !row.zoneName?.trim()).length;
    process.stdout.write(`${JSON.stringify({
        totalRowsRead: rows.length,
        uniqueHotelCodes: new Set(codes.filter(Boolean)).size,
        duplicateCodes,
        invalidOrMissingCodes: missingCodes,
        starGradingDistribution: rows.reduce((counts, row) => {
            const grading = String(row.starGrading ?? "<missing>");
            counts[grading] = (counts[grading] ?? 0) + 1;
            return counts;
        }, {}),
        invalidStarGrading,
        destinationCodeDistribution: destinationCounts,
        invalidOrMissingZoneCodes: missingZoneCodes,
        invalidOrMissingZoneNames: missingZoneNames,
    }, null, 2)}\n`);
    if (rows.length !== 340 || new Set(codes.filter(Boolean)).size !== 340 || duplicateCodes.length || missingCodes || invalidStarGrading || missingZoneCodes || missingZoneNames) {
        throw new Error("Approved hotel catalogue validation failed.");
    }
}
async function main() {
    const workbookRows = await Promise.all(sources.map(async (source) => (0, catalogue_1.readHotelCatalogueWorkbook)(await (0, promises_1.readFile)((0, node_path_1.join)(sourceDirectory, source)), "")));
    const rows = workbookRows.flat();
    validateRows(rows);
    if (process.argv.includes("--validate-only")) {
        return;
    }
    const report = await (0, catalogue_1.importHotelCatalogue)(rows, new hotel_catalogue_prisma_repository_1.HotelCataloguePrismaRepository());
    process.stdout.write(`${JSON.stringify({ importReport: report }, null, 2)}\n`);
    const prisma = (0, prisma_1.getPrismaClient)();
    const [total, active, fourStar, fiveStar, missingDestination, missingZone, missingStar, duplicateCodes] = await Promise.all([
        prisma.hotelCatalogueEntry.count(),
        prisma.hotelCatalogueEntry.count({ where: { active: true } }),
        prisma.hotelCatalogueEntry.count({ where: { starGrading: 4 } }),
        prisma.hotelCatalogueEntry.count({ where: { starGrading: 5 } }),
        prisma.hotelCatalogueEntry.count({ where: { destinationCode: "" } }),
        prisma.hotelCatalogueEntry.count({ where: { zoneCode: "" } }),
        prisma.hotelCatalogueEntry.count({ where: { starGrading: { notIn: [4, 5] } } }),
        prisma.hotelCatalogueEntry.groupBy({ by: ["hotelCode"], _count: { hotelCode: true }, having: { hotelCode: { _count: { gt: 1 } } } }),
    ]);
    process.stdout.write(`${JSON.stringify({ total, uniqueHotelCodes: total, active, fourStar, fiveStar, missingDestination, missingZone, missingStar, duplicateCodes: duplicateCodes.length }, null, 2)}\n`);
    await prisma.$disconnect();
}
void main().catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
});
//# sourceMappingURL=import-hotel-catalogue.js.map