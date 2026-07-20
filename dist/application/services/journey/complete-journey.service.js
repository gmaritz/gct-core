"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteJourneyService = void 0;
const aggregates_1 = require("@domain/aggregates");
const exceptions_1 = require("@domain/exceptions");
const journey_mapper_1 = require("../../mappers/journey.mapper");
/**
 * CompleteJourneyService
 *
 * Orchestrates marking an ongoing journey as completed.
 * State transition rules remain within the Journey aggregate.
 */
class CompleteJourneyService {
    constructor(journeyRepository) {
        this.journeyRepository = journeyRepository;
    }
    async execute(command) {
        const journey = await this.journeyRepository.findById(command.journeyId);
        if (!journey) {
            throw new exceptions_1.JourneyNotFoundException(command.journeyId);
        }
        journey.updateStatus(aggregates_1.JourneyStatus.COMPLETED);
        await this.journeyRepository.save(journey);
        journey.clearDomainEvents();
        return journey_mapper_1.JourneyMapper.toDTO(journey);
    }
}
exports.CompleteJourneyService = CompleteJourneyService;
//# sourceMappingURL=complete-journey.service.js.map