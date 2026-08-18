import { HotelCatalogueRepository, HotelCatalogueFilter, HotelCatalogueEntry } from "../../../../application/accommodation/catalogue";
import { getPrismaClient } from "../../../../bootstrap/prisma";

export class HotelCataloguePrismaRepository implements HotelCatalogueRepository {
  public async findActive(filter: HotelCatalogueFilter = {}): Promise<ReadonlyArray<HotelCatalogueEntry>> {
    const rows = await getPrismaClient().hotelCatalogueEntry.findMany({
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

  public async upsert(entry: HotelCatalogueEntry): Promise<"inserted" | "updated" | "unchanged"> {
    const prisma = getPrismaClient();
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

  public async deactivateMissing(hotelCodes: ReadonlyArray<string>): Promise<number> {
    const result = await getPrismaClient().hotelCatalogueEntry.updateMany({
      where: { active: true, hotelCode: { notIn: [...hotelCodes] } },
      data: { active: false },
    });
    return result.count;
  }
}