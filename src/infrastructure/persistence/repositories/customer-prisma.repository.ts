import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

import {
  CustomerEmailConflictError,
  CustomerResolutionInput,
  CustomerResolutionRepository,
  ResolvedCustomer,
} from "@application/customers";
import { getPrismaClient } from "../../../bootstrap/prisma";

const ANONYMOUS_BOOKING_CUSTOMER_TYPE = "ANONYMOUS_BOOKING";

export class CustomerPrismaRepository implements CustomerResolutionRepository {
  public constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  public async findByNormalizedEmail(email: string): Promise<ResolvedCustomer | null> {
    const customer = await this.prisma.customer.findUnique({ where: { email }, select: { id: true } });
    return customer ? { customerId: customer.id } : null;
  }

  public async createAnonymousCustomer(input: Required<CustomerResolutionInput>): Promise<ResolvedCustomer> {
    const prisma = this.prisma;
    const customerType = await prisma.customerType.findUnique({ where: { code: ANONYMOUS_BOOKING_CUSTOMER_TYPE }, select: { id: true } });
    if (!customerType) throw new Error("The anonymous booking Customer Type is unavailable.");
    try {
      const customer = await prisma.customer.create({
        data: {
          customerNumber: `CUST-${randomUUID()}`,
          customerTypeId: customerType.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          mobileNumber: input.phone || null,
        },
        select: { id: true },
      });
      return { customerId: customer.id };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new CustomerEmailConflictError();
      }
      throw error;
    }
  }
}