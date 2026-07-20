"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJourneyService = void 0;
const aggregates_1 = require("@domain/aggregates");
const journey_mapper_1 = require("../../mappers/journey.mapper");
/**
 * CreateJourneyService
 *
 * Orchestrates the creation of a new journey.
 * Journey validation remains within the Journey aggregate.
 */
class CreateJourneyService {
    constructor(journeyRepository) {
        this.journeyRepository = journeyRepository;
    }
    async execute(command) {
        const journey = aggregates_1.Journey.create(command.travelerId, command.name, command.description, command.startDate, command.endDate);
        await this.journeyRepository.save(journey);
        // Domain events (JourneyCreatedEvent) are available here for publishing.
        journey.clearDomainEvents();
        return journey_mapper_1.JourneyMapper.toDTO(journey);
    }
}
exports.CreateJourneyService = CreateJourneyService;
//# sourceMappingURL=create-journey.service.js.map