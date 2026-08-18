import { importHotelCatalogue } from "./hotel-catalogue-import";
import { InMemoryHotelCatalogueRepository } from "./hotel-catalogue-repository";
import { HotelCatalogueService } from "./hotel-catalogue-service";

const rows = [
  { hotelCode: " 1 ", starGrading: 4, destinationCode: "CPT", zoneCode: "3", zoneName: "Stellenbosch" },
  { hotelCode: "2", starGrading: 5, destinationCode: "CPT", zoneCode: "4", zoneName: "Cape Town" },
];

describe("Hotel catalogue", () => {
  it("imports idempotently and applies active attribute filters", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    expect((await importHotelCatalogue(rows, repository)).inserted).toBe(2);
    expect((await importHotelCatalogue(rows, repository)).unchanged).toBe(2);

    const service = new HotelCatalogueService(repository);
    await expect(service.select({ destinationCode: "CPT", zoneCode: "3", starGrading: 4 })).resolves.toEqual({
      hotelCodes: ["1"],
      selectionMode: "ATTRIBUTE",
    });
  });

  it("gives explicit codes precedence and rejects duplicates or invalid rows", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    await importHotelCatalogue(rows, repository);
    const service = new HotelCatalogueService(repository);
    await expect(service.select({ hotelCodes: ["2"], destinationCode: "CPT", starGrading: 4 })).resolves.toEqual({
      hotelCodes: [],
      selectionMode: "EXPLICIT",
    });
    const report = await importHotelCatalogue([
      ...rows,
      { hotelCode: "1", starGrading: 5, destinationCode: "CPT", zoneCode: "3", zoneName: "Duplicate" },
      { hotelCode: "3", starGrading: 3, destinationCode: "CPT", zoneCode: "3", zoneName: "Invalid" },
    ], repository);
    expect(report.rejected).toHaveLength(2);
  });
});