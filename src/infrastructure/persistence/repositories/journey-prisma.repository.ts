/**
 * Journey Prisma Repository
 * 
 * Implements IJourneyRepository using Prisma.
 */
import { IJourneyRepository } from '@domain/repositories';
import { Journey } from '@domain/aggregates';
import { JourneyMapper } from '@application/mappers';
import { PrismaService } from '../prisma/prisma.service';

export class JourneyPrismaRepository implements IJourneyRepository {
  async save(aggregate: Journey): Promise<void> {
    const data = JourneyMapper.toPersistence(aggregate);
    const prisma = PrismaService.getInstance();

    try {
      await prisma.journey.upsert({
        where: { id: aggregate.getId() },
        update: data,
        create: data,
      });
    } catch (error) {
      throw new Error(`Failed to save journey: ${error}`);
    }
  }

  async findById(id: string): Promise<Journey | null> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.journey.findUnique({
        where: { id },
      });

      if (!raw) {
        return null;
      }

      return JourneyMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find journey: ${error}`);
    }
  }

  async findByJourneyCode(journeyCode: string): Promise<Journey | null> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.journey.findUnique({
        where: { journeyCode },
      });

      if (!raw) {
        return null;
      }

      return JourneyMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find journey by code: ${error}`);
    }
  }

  async findByTravelerId(travelerId: string): Promise<Journey[]> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.journey.findMany({
        where: { travelerId },
      });

      return raw.map((item: any) => JourneyMapper.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find journeys by traveller: ${error}`);
    }
  }

  async findAll(): Promise<Journey[]> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.journey.findMany();
      return raw.map((item: any) => JourneyMapper.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find all journeys: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const prisma = PrismaService.getInstance();

    try {
      await prisma.journey.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete journey: ${error}`);
    }
  }
}
