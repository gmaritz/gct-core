"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationPrismaRepository = void 0;
const mappers_1 = require("@application/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
class ReservationPrismaRepository {
    async save(aggregate) {
        const data = mappers_1.ReservationMapper.toPersistence(aggregate);
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            await prisma.reservation.upsert({
                where: { id: aggregate.getId() },
                update: data,
                create: data,
            });
        }
        catch (error) {
            throw new Error(`Failed to save reservation: ${error}`);
        }
    }
    async findById(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.reservation.findUnique({
                where: { id },
            });
            if (!raw) {
                return null;
            }
            return mappers_1.ReservationMapper.toDomain(raw);
        }
        catch (error) {
            throw new Error(`Failed to find reservation: ${error}`);
        }
    }
    async findByReservationNumber(reservationNumber) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.reservation.findUnique({
                where: { reservationNumber },
            });
            if (!raw) {
                return null;
            }
            return mappers_1.ReservationMapper.toDomain(raw);
        }
        catch (error) {
            throw new Error(`Failed to find reservation by number: ${error}`);
        }
    }
    async findByTravelerId(travelerId) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.reservation.findMany({
                where: { travelerId },
            });
            return raw.map((item) => mappers_1.ReservationMapper.toDomain(item));
        }
        catch (error) {
            throw new Error(`Failed to find reservations by traveller: ${error}`);
        }
    }
    async findByJourneyId(journeyId) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            const raw = await prisma.reservation.findMany({
                where: { journeyId },
            });
            return raw.map((item) => mappers_1.ReservationMapper.toDomain(item));
        }
        catch (error) {
            throw new Error(`Failed to find reservations by journey: ${error}`);
        }
    }
    async delete(id) {
        const prisma = prisma_service_1.PrismaService.getInstance();
        try {
            await prisma.reservation.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new Error(`Failed to delete reservation: ${error}`);
        }
    }
}
exports.ReservationPrismaRepository = ReservationPrismaRepository;
//# sourceMappingURL=journey-prisma.repository.js.map