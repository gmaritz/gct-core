"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTravellerService = void 0;
const aggregates_1 = require("@domain/aggregates");
const traveller_mapper_1 = require("../../mappers/traveller.mapper");
/**
 * CreateTravellerService
 *
 * Orchestrates the registration of a new traveller.
 * Identity validation remains within the Traveller aggregate.
 */
class CreateTravellerService {
    constructor(travellerRepository) {
        this.travellerRepository = travellerRepository;
    }
    async execute(command) {
        const existing = await this.travellerRepository.findByEmail(command.email);
        if (existing) {
            throw new Error(`A traveller with email ${command.email} already exists`);
        }
        const traveller = aggregates_1.Traveller.create(command.firstName, command.lastName, command.email);
        await this.travellerRepository.save(traveller);
        // Domain events (TravellerCreatedEvent) are available here for publishing.
        traveller.clearDomainEvents();
        return traveller_mapper_1.TravellerMapper.toDTO(traveller);
    }
}
exports.CreateTravellerService = CreateTravellerService;
//# sourceMappingURL=create-traveller.service.js.map