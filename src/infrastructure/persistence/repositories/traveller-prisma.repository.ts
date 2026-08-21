/**
 * Traveller Prisma Repository
 * 
 * Implements ITravellerRepository using Prisma.
 */
import { ITravellerRepository, TravellerPersistenceContext } from '@domain/repositories';
import { Traveller } from '@domain/aggregates';
import { TravellerMapper } from '@application/mappers';
import { PrismaService } from '../prisma/prisma.service';

export class TravellerPrismaRepository implements ITravellerRepository {
  async save(aggregate: Traveller, context?: TravellerPersistenceContext): Promise<void> {
    void context;
    const data = TravellerMapper.toPersistence(aggregate);
    const prisma = PrismaService.getInstance();

    try {
      await prisma.traveller.upsert({
        where: { id: aggregate.getId() },
        update: data,
        create: data,
      });
    } catch (error) {
      throw new Error(`Failed to save traveller: ${error}`);
    }
  }

  async findById(id: string): Promise<Traveller | null> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.traveller.findUnique({
        where: { id },
      });

      if (!raw) {
        return null;
      }

      return TravellerMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find traveller: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<Traveller | null> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.traveller.findUnique({
        where: { email },
      });

      if (!raw) {
        return null;
      }

      return TravellerMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find traveller by email: ${error}`);
    }
  }

  async findAll(): Promise<Traveller[]> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.traveller.findMany();
      return raw.map((item: any) => TravellerMapper.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find all travellers: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const prisma = PrismaService.getInstance();

    try {
      await prisma.traveller.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete traveller: ${error}`);
    }
  }
}
