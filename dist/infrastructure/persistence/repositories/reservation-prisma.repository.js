"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPrismaRepository = void 0;
const mappers_1 = require("@application/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
class JourneyPrismaRepository {
    async save(aggregate) {
        const data = mappers_1.JourneyMapper.toPersistence(aggregate);
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            await prisma.journey.upsert({
                where: { id: aggregate.getId() },
                update: data,
                create: data,
            });
        }
        catch (error) {
            throw new Error(`Failed to save journey: ${error}`);
        }
    }
    async findById(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.journey.findUnique({
                where: { id },
            });
            if (!raw) {
                return null;
            }
            return mappers_1.JourneyMapper.toDomain(raw);
        }
        catch (error) {
            throw new Error(`Failed to find journey: ${error}`);
        }
    }
    async findByJourneyCode(journeyCode) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.journey.findUnique({
                where: { journeyCode },
            });
            if (!raw) {
                return null;
            }
            return mappers_1.JourneyMapper.toDomain(raw);
        }
        catch (error) {
            throw new Error(`Failed to find journey by code: ${error}`);
        }
    }
    async findByTravelerId(travelerId) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.journey.findMany({
                where: { travelerId },
            });
            return raw.map((item) => mappers_1.JourneyMapper.toDomain(item));
        }
        catch (error) {
            throw new Error(`Failed to find journeys by traveller: ${error}`);
        }
    }
    async findAll() {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.journey.findMany();
            return raw.map((item) => mappers_1.JourneyMapper.toDomain(item));
        }
        catch (error) {
            throw new Error(`Failed to find all journeys: ${error}`);
        }
    }
    async delete(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            await prisma.journey.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new Error(`Failed to delete journey: ${error}`);
        }
    }
}
exports.JourneyPrismaRepository = JourneyPrismaRepository;
//# sourceMappingURL=reservation-prisma.repository.js.map