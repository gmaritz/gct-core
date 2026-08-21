"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravellerPrismaRepository = void 0;
const mappers_1 = require("@application/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
class TravellerPrismaRepository {
    async save(aggregate, context) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const existing = context?.customerId
                ? null
                : await prisma.traveller.findUnique({
                    where: { id: aggregate.getId() },
                    select: { customerId: true },
                });
            const customerId = context?.customerId ?? existing?.customerId;
            if (!customerId) {
                throw new Error("Customer ID is required to persist a traveller.");
            }
            const data = mappers_1.TravellerMapper.toPersistence(aggregate, customerId);
            await prisma.traveller.upsert({
                where: { id: aggregate.getId() },
                update: data,
                create: data,
            });
        }
        catch (error) {
            throw new Error(`Failed to save traveller: ${error}`);
        }
    }
    async findById(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.traveller.findUnique({
                where: { id },
                include: { customer: true },
            });
            if (!raw) {
                return null;
            }
            return mappers_1.TravellerMapper.toDomain(raw);
        }
        catch (error) {
            throw new Error(`Failed to find traveller: ${error}`);
        }
    }
    async findByEmail(email) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const customer = await prisma.customer.findFirst({
                where: { email },
                include: { travellers: true },
            });
            const raw = customer?.travellers[0]
                ? { ...customer.travellers[0], customer: { email: customer.email } }
                : null;
            if (!raw) {
                return null;
            }
            return mappers_1.TravellerMapper.toDomain(raw);
        }
        catch (error) {
            throw new Error(`Failed to find traveller by email: ${error}`);
        }
    }
    async findAll() {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.traveller.findMany({ include: { customer: true } });
            return raw.map((item) => mappers_1.TravellerMapper.toDomain(item));
        }
        catch (error) {
            throw new Error(`Failed to find all travellers: ${error}`);
        }
    }
    async delete(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            await prisma.traveller.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new Error(`Failed to delete traveller: ${error}`);
        }
    }
}
exports.TravellerPrismaRepository = TravellerPrismaRepository;
//# sourceMappingURL=traveller-prisma.repository.js.map