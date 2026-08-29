import {
  CustomerEmailConflictError,
  CustomerResolutionRepository,
  CustomerResolutionService,
} from "./customer-resolution-service";

function repository(overrides: Partial<CustomerResolutionRepository> = {}): CustomerResolutionRepository {
  return {
    findByNormalizedEmail: async () => null,
    createAnonymousCustomer: async () => ({ customerId: "customer-001" }),
    ...overrides,
  };
}

describe("CustomerResolutionService", () => {
  it("returns an existing Customer using normalized email", async () => {
    const findByNormalizedEmail = jest.fn(async () => ({ customerId: "customer-existing" }));
    const service = new CustomerResolutionService(repository({ findByNormalizedEmail }));

    await expect(service.resolveOrCreate({ email: " Guest@Example.COM ", firstName: "Ava", lastName: "Cape" }))
      .resolves.toEqual({ customerId: "customer-existing" });
    expect(findByNormalizedEmail).toHaveBeenCalledWith("guest@example.com");
  });

  it("creates an anonymous Customer when no matching email exists", async () => {
    const createAnonymousCustomer = jest.fn(async () => ({ customerId: "customer-new" }));
    const service = new CustomerResolutionService(repository({ createAnonymousCustomer }));

    await expect(service.resolveOrCreate({ email: "guest@example.com", firstName: " Ava ", lastName: " Cape ", phone: " 123 " }))
      .resolves.toEqual({ customerId: "customer-new" });
    expect(createAnonymousCustomer).toHaveBeenCalledWith({ email: "guest@example.com", firstName: "Ava", lastName: "Cape", phone: "123" });
  });

  it("resolves the Customer created by a concurrent request after a unique conflict", async () => {
    const findByNormalizedEmail = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ customerId: "customer-concurrent" });
    const service = new CustomerResolutionService(repository({
      findByNormalizedEmail,
      createAnonymousCustomer: async () => { throw new CustomerEmailConflictError(); },
    }));

    await expect(service.resolveOrCreate({ email: "guest@example.com", firstName: "Ava", lastName: "Cape" }))
      .resolves.toEqual({ customerId: "customer-concurrent" });
  });

  it("rejects incomplete Customer creation data", async () => {
    const service = new CustomerResolutionService(repository());

    await expect(service.resolveOrCreate({ email: "", firstName: "Ava", lastName: "Cape" }))
      .rejects.toThrow("Valid customer contact information is required.");
    await expect(service.resolveOrCreate({ email: "not-an-email", firstName: "Ava", lastName: "Cape" }))
      .rejects.toThrow("Valid customer contact information is required.");
  });
});