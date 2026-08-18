"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelCataloguePrismaRepository = void 0;
const prisma_1 = require("../../../../bootstrap/prisma");
class HotelCataloguePrismaRepository {
    async findActive(filter = {}) {
        const rows = await (0, prisma_1.getPrismaClient)().hotelCatalogueEntry.findMany({
            where: {
                active: true,
                ...(filter.hotelCodes ? { hotelCode: { in: [...filter.hotelCodes] } } : {}),
                ...(filter.destinationCode ? { destinationCode: filter.destinationCode } : {}),
                ...(filter.zoneCode ? { zoneCode: filter.zoneCode } : {}),
                ...(filter.starGrading === undefined ? {} : { starGrading: filter.starGrading }),
            },
            orderBy: [{ zoneName: "asc" }, { hotelCode: "asc" }],
        });
        return Object.freeze(rows.map((row) => ({
            hotelCode: row.hotelCode,
            starGrading: row.starGrading,
            destinationCode: row.destinationCode,
            zoneCode: row.zoneCode,
            zoneName: row.zoneName,
            active: row.active,
        })));
    }
    async upsert(entry) {
        const prisma = (0, prisma_1.getPrismaClient)();
        const existing = await prisma.hotelCatalogueEntry.findUnique({ where: { hotelCode: entry.hotelCode } });
        if (existing && existing.starGrading === entry.starGrading && existing.destinationCode === entry.destinationCode && existing.zoneCode === entry.zoneCode && existing.zoneName === entry.zoneName && existing.active === entry.active) {
            return "unchanged";
        }
        await prisma.hotelCatalogueEntry.upsert({
            where: { hotelCode: entry.hotelCode },
            update: { starGrading: entry.starGrading, destinationCode: entry.destinationCode, zoneCode: entry.zoneCode, zoneName: entry.zoneName, active: entry.active },
            create: entry,
        });
        return existing ? "updated" : "inserted";
    }
    async deactivateMissing(hotelCodes) {
        const result = await (0, prisma_1.getPrismaClient)().hotelCatalogueEntry.updateMany({
            where: { active: true, hotelCode: { notIn: [...hotelCodes] } },
            data: { active: false },
        });
        return result.count;
    }
}
exports.HotelCataloguePrismaRepository = HotelCataloguePrismaRepository;
//# sourceMappingURL=hotel-catalogue-prisma.repository.js.map