"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveJourneyService = void 0;
const exceptions_1 = require("@domain/exceptions");
const journey_mapper_1 = require("../../mappers/journey.mapper");
/**
 * RetrieveJourneyService
 *
 * Retrieves a journey by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
class RetrieveJourneyService {
    constructor(journeyRepository) {
        this.journeyRepository = journeyRepository;
    }
    async execute(query) {
        const journey = await this.journeyRepository.findById(query.journeyId);
        if (!journey) {
            throw new exceptions_1.JourneyNotFoundException(query.journeyId);
        }
        return journey_mapper_1.JourneyMapper.toDTO(journey);
    }
}
exports.RetrieveJourneyService = RetrieveJourneyService;
//# sourceMappingURL=retrieve-journey.service.js.map