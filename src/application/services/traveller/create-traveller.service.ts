import { ITravellerRepository } from '@domain/repositories';
import { Traveller } from '@domain/aggregates';
import { CreateTravellerCommand } from '../../commands/create-traveller.command';
import { TravellerMapper } from '../../mappers/traveller.mapper';
import { TravellerDTO } from '../../dto/traveller.dto';

/**
 * CreateTravellerService
 *
 * Orchestrates the registration of a new traveller.
 * Identity validation remains within the Traveller aggregate.
 */
export class CreateTravellerService {
  constructor(private readonly travellerRepository: ITravellerRepository) {}

  async execute(command: CreateTravellerCommand): Promise<TravellerDTO> {
    if (!command.customerId?.trim()) {
      throw new Error("Customer ID is required");
    }

    const existing = await this.travellerRepository.findByEmail(command.email);

    if (existing) {
      throw new Error(`A traveller with email ${command.email} already exists`);
    }

    const traveller = Traveller.create(command.firstName, command.lastName, command.email);

    await this.travellerRepository.save(traveller, { customerId: command.customerId });

    // Domain events (TravellerCreatedEvent) are available here for publishing.
    traveller.clearDomainEvents();

    return TravellerMapper.toDTO(traveller);
  }
}
