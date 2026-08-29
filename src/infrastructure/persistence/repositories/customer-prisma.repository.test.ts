import { CustomerEmailConflictError } from "@application/customers";
import { CustomerPrismaRepository } from "./customer-prisma.repository";

function prisma(overrides: Record<string, unknown> = {}): ConstructorParameters<typeof CustomerPrismaRepository>[0] {
  return {
    customer: {
      findUnique: async () => null,
      create: async () => ({ id: "customer-001" }),
    },
    customerType: {
      findUnique: async () => ({ id: "customer-type-anonymous" }),
    },
    ...overrides,
  } as unknown as ConstructorParameters<typeof CustomerPrismaRepository>[0];
}

describe("CustomerPrismaRepository", () => {
  it("creates Customers with the authoritative anonymous booking type", async () => {
    const create = jest.fn(async () => ({ id: "customer-001" }));
    const repository = new CustomerPrismaRepository(prisma({
      customer: { findUnique: async () => null, create },
    }));

    await expect(repository.createAnonymousCustomer({
      email: "guest@example.com",
      firstName: "Ava",
      lastName: "Cape",
      phone: "123",
    })).resolves.toEqual({ customerId: "customer-001" });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        customerTypeId: "customer-type-anonymous",
        email: "guest@example.com",
      }),
    }));
  });

  it("translates the unique email constraint failure into the resolution contract", async () => {
    const repository = new CustomerPrismaRepository(prisma({
      customer: {
        findUnique: async () => null,
        create: async () => { throw { code: "P2002" }; },
      },
    }));

    await expect(repository.createAnonymousCustomer({
      email: "guest@example.com",
      firstName: "Ava",
      lastName: "Cape",
      phone: "",
    })).rejects.toBeInstanceOf(CustomerEmailConflictError);
  });

  it("fails when the authoritative anonymous booking type is unavailable", async () => {
    const repository = new CustomerPrismaRepository(prisma({
      customerType: { findUnique: async () => null },
    }));

    await expect(repository.createAnonymousCustomer({
      email: "guest@example.com",
      firstName: "Ava",
      lastName: "Cape",
      phone: "",
    })).rejects.toThrow("anonymous booking Customer Type is unavailable");
  });
});