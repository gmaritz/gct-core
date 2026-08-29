"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPrismaRepository = void 0;
const crypto_1 = require("crypto");
const customers_1 = require("@application/customers");
const prisma_1 = require("../../../bootstrap/prisma");
const ANONYMOUS_BOOKING_CUSTOMER_TYPE = "ANONYMOUS_BOOKING";
class CustomerPrismaRepository {
    constructor(prisma = (0, prisma_1.getPrismaClient)()) {
        this.prisma = prisma;
    }
    async findByNormalizedEmail(email) {
        const customer = await this.prisma.customer.findUnique({ where: { email }, select: { id: true } });
        return customer ? { customerId: customer.id } : null;
    }
    async createAnonymousCustomer(input) {
        const prisma = this.prisma;
        const customerType = await prisma.customerType.findUnique({ where: { code: ANONYMOUS_BOOKING_CUSTOMER_TYPE }, select: { id: true } });
        if (!customerType)
            throw new Error("The anonymous booking Customer Type is unavailable.");
        try {
            const customer = await prisma.customer.create({
                data: {
                    customerNumber: `CUST-${(0, crypto_1.randomUUID)()}`,
                    customerTypeId: customerType.id,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    mobileNumber: input.phone || null,
                },
                select: { id: true },
            });
            return { customerId: customer.id };
        }
        catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
                throw new customers_1.CustomerEmailConflictError();
            }
            throw error;
        }
    }
}
exports.CustomerPrismaRepository = CustomerPrismaRepository;
//# sourceMappingURL=customer-prisma.repository.js.map