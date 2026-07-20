/**
 * Reservation Prisma Repository
 * 
 * Implements IReservationRepository using Prisma.
 */
import { IReservationRepository } from '@domain/repositories';
import { Reservation } from '@domain/aggregates';
import { ReservationMapper } from '@application/mappers';
import { PrismaService } from '../prisma/prisma.service';

export class ReservationPrismaRepository implements IReservationRepository {
  async save(aggregate: Reservation): Promise<void> {
    const data = ReservationMapper.toPersistence(aggregate);
    const prisma = PrismaService.getInstance();

    try {
      await prisma.reservation.upsert({
        where: { id: aggregate.getId() },
        update: data,
        create: data,
      });
    } catch (error) {
      throw new Error(`Failed to save reservation: ${error}`);
    }
  }

  async findById(id: string): Promise<Reservation | null> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.reservation.findUnique({
        where: { id },
      });

      if (!raw) {
        return null;
      }

      return ReservationMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find reservation: ${error}`);
    }
  }

  async findByReservationNumber(reservationNumber: string): Promise<Reservation | null> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.reservation.findUnique({
        where: { reservationNumber },
      });

      if (!raw) {
        return null;
      }

      return ReservationMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find reservation by number: ${error}`);
    }
  }

  async findByTravelerId(travelerId: string): Promise<Reservation[]> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.reservation.findMany({
        where: { travelerId },
      });

      return raw.map((item: any) => ReservationMapper.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find reservations by traveller: ${error}`);
    }
  }

  async findByJourneyId(journeyId: string): Promise<Reservation[]> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.reservation.findMany({
        where: { journeyId },
      });

      return raw.map((item: any) => ReservationMapper.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find reservations by journey: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const prisma = PrismaService.getInstance();

    try {
      await prisma.reservation.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete reservation: ${error}`);
    }
  }
}
