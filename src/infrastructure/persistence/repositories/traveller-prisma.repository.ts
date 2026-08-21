/**
 * Traveller Prisma Repository
 * 
 * Implements ITravellerRepository using Prisma.
 */
import { ITravellerRepository, TravellerPersistenceContext } from '@domain/repositories';
import { Traveller } from '@domain/aggregates';
import { TravellerMapper, TravellerPersistenceRecord } from '@application/mappers';
import { PrismaService } from '../prisma/prisma.service';

export class TravellerPrismaRepository implements ITravellerRepository {
  async save(aggregate: Traveller, context?: TravellerPersistenceContext): Promise<void> {
    const prisma = PrismaService.getInstance();

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
      const data = TravellerMapper.toPersistence(aggregate, customerId);

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
        include: { customer: true },
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

      return TravellerMapper.toDomain(raw);
    } catch (error) {
      throw new Error(`Failed to find traveller by email: ${error}`);
    }
  }

  async findAll(): Promise<Traveller[]> {
    const prisma = PrismaService.getInstance();

    try {
      const raw = await prisma.traveller.findMany({ include: { customer: true } });
      return raw.map((item: TravellerPersistenceRecord) => TravellerMapper.toDomain(item));
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
