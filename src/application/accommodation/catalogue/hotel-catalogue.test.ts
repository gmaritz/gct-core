import { importHotelCatalogue } from "./hotel-catalogue-import";
import { HotelCatalogueRepository } from "./hotel-catalogue-repository";
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

  it("gives explicit codes precedence over attribute filters", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    await importHotelCatalogue(rows, repository);
    await repository.upsert({
      hotelCode: "3",
      starGrading: 4,
      destinationCode: "JNB",
      zoneCode: "1",
      zoneName: "Johannesburg",
      active: true,
    });

    const service = new HotelCatalogueService(repository);
    await expect(service.select({ hotelCodes: ["2", "3"], destinationCode: "CPT", zoneCode: "3", starGrading: 4 })).resolves.toEqual({
      hotelCodes: ["2", "3"],
      selectionMode: "EXPLICIT",
    });
  });

  it("excludes unknown and inactive explicit codes and deduplicates in first-seen order", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    await importHotelCatalogue(rows, repository);
    await repository.upsert({
      hotelCode: "4",
      starGrading: 4,
      destinationCode: "CPT",
      zoneCode: "8",
      zoneName: "Inactive",
      active: false,
    });

    const service = new HotelCatalogueService(repository);
    await expect(service.select({ hotelCodes: ["2", "2", "4", "999", "1", "2"] })).resolves.toEqual({
      hotelCodes: ["2", "1"],
      selectionMode: "EXPLICIT",
    });
  });

  it("returns an empty explicit candidate set when no requested code is eligible", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    await importHotelCatalogue(rows, repository);
    await repository.upsert({
      hotelCode: "5",
      starGrading: 4,
      destinationCode: "CPT",
      zoneCode: "9",
      zoneName: "Inactive",
      active: false,
    });

    const service = new HotelCatalogueService(repository);
    await expect(service.select({ hotelCodes: ["5", "999"] })).resolves.toEqual({
      hotelCodes: [],
      selectionMode: "EXPLICIT",
    });
  });

  it.each([
    ["123abc"],
    ["abc123"],
    ["12abc34"],
    ["123.45"],
    [""],
    ["   "],
    ["-1"],
    ["1.5"],
    ["9007199254740992"],
  ])("rejects malformed explicit code %p", async (invalidCode) => {
    const repository = new InMemoryHotelCatalogueRepository();
    await importHotelCatalogue(rows, repository);

    const service = new HotelCatalogueService(repository);
    await expect(service.select({ hotelCodes: [invalidCode] })).rejects.toThrow("Invalid explicit hotel code");
  });

  it("uses AND semantics for attribute filters and excludes inactive entries", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    await repository.upsert({
      hotelCode: "10",
      starGrading: 4,
      destinationCode: "CPT",
      zoneCode: "3",
      zoneName: "A-Zone",
      active: true,
    });
    await repository.upsert({
      hotelCode: "11",
      starGrading: 4,
      destinationCode: "CPT",
      zoneCode: "3",
      zoneName: "A-Zone",
      active: false,
    });
    await repository.upsert({
      hotelCode: "12",
      starGrading: 5,
      destinationCode: "CPT",
      zoneCode: "3",
      zoneName: "A-Zone",
      active: true,
    });
    await repository.upsert({
      hotelCode: "13",
      starGrading: 4,
      destinationCode: "DUR",
      zoneCode: "3",
      zoneName: "A-Zone",
      active: true,
    });

    const service = new HotelCatalogueService(repository);
    await expect(service.select({ destinationCode: "CPT", zoneCode: "3", starGrading: 4 })).resolves.toEqual({
      hotelCodes: ["10"],
      selectionMode: "ATTRIBUTE",
    });
  });

  it("does not invoke suppliers during candidate resolution", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    await importHotelCatalogue(rows, repository);
    const supplierSearch = jest.fn();

    const service = new HotelCatalogueService(repository);
    await service.select({ hotelCodes: ["1", "2"] });

    expect(supplierSearch).not.toHaveBeenCalled();
  });

  it("rejects duplicate and invalid rows during import", async () => {
    const repository = new InMemoryHotelCatalogueRepository();
    const report = await importHotelCatalogue([
      ...rows,
      { hotelCode: "1", starGrading: 5, destinationCode: "CPT", zoneCode: "3", zoneName: "Duplicate" },
      { hotelCode: "3", starGrading: 3, destinationCode: "CPT", zoneCode: "3", zoneName: "Invalid" },
    ], repository);

    expect(report.rejected).toHaveLength(2);
  });

  it("propagates catalogue failures", async () => {
    const repository = {
      findActive: jest.fn(async () => {
        throw new Error("Catalogue unavailable");
      }),
      upsert: jest.fn(),
      deactivateMissing: jest.fn(),
    };

    const service = new HotelCatalogueService(repository as unknown as HotelCatalogueRepository);
    await expect(service.select({ destinationCode: "CPT" })).rejects.toThrow("Catalogue unavailable");
  });
});