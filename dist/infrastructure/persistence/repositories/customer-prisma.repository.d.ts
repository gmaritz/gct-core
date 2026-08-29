import { PrismaClient } from "@prisma/client";
import { CustomerResolutionInput, CustomerResolutionRepository, ResolvedCustomer } from "@application/customers";
export declare class CustomerPrismaRepository implements CustomerResolutionRepository {
    private readonly prisma;
    constructor(prisma?: PrismaClient);
    findByNormalizedEmail(email: string): Promise<ResolvedCustomer | null>;
    createAnonymousCustomer(input: Required<CustomerResolutionInput>): Promise<ResolvedCustomer>;
}
//# sourceMappingURL=customer-prisma.repository.d.ts.map