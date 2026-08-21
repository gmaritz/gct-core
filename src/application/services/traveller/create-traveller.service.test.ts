import { CreateTravellerCommand } from "../../commands/create-traveller.command";
import { ITravellerRepository, TravellerPersistenceContext } from "@domain/repositories";
import { Traveller } from "@domain/aggregates";
import { CreateTravellerService } from "./create-traveller.service";

describe("CreateTravellerService customer association", () => {
  it("passes explicit customer context to traveller persistence", async () => {
    let savedContext: TravellerPersistenceContext | undefined;
    const repository: ITravellerRepository = {
      findByEmail: async () => null,
      findAll: async () => [],
      findById: async () => null,
      save: async (_traveller: Traveller, context?: TravellerPersistenceContext): Promise<void> => {
        savedContext = context;
      },
      delete: async (): Promise<void> => undefined,
    };

    const service = new CreateTravellerService(repository);
    const result = await service.execute(new CreateTravellerCommand(
      "customer-001",
      "Ari",
      "Jacobs",
      "ari@example.com",
    ));

    expect(result.email).toBe("ari@example.com");
    expect(savedContext).toEqual({ customerId: "customer-001" });
  });

  it("rejects a missing customer context before persistence", async () => {
    const save = jest.fn();
    const repository: ITravellerRepository = {
      findByEmail: async () => null,
      findAll: async () => [],
      findById: async () => null,
      save,
      delete: async (): Promise<void> => undefined,
    };

    const service = new CreateTravellerService(repository);

    await expect(service.execute(new CreateTravellerCommand(
      "",
      "Ari",
      "Jacobs",
      "ari@example.com",
    ))).rejects.toThrow("Customer ID is required");
    expect(save).not.toHaveBeenCalled();
  });
});
