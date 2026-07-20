"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravellerPrismaRepository = void 0;
const mappers_1 = require("@application/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
class TravellerPrismaRepository {
    async save(aggregate) {
        const data = mappers_1.TravellerMapper.toPersistence(aggregate);
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
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
            const raw = await prisma.traveller.findUnique({
                where: { email },
            });
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
            const raw = await prisma.traveller.findMany();
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