"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveTravellerService = void 0;
const exceptions_1 = require("@domain/exceptions");
const traveller_mapper_1 = require("../../mappers/traveller.mapper");
/**
 * RetrieveTravellerService
 *
 * Retrieves a traveller by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
class RetrieveTravellerService {
    constructor(travellerRepository) {
        this.travellerRepository = travellerRepository;
    }
    async execute(query) {
        const traveller = await this.travellerRepository.findById(query.travelerId);
        if (!traveller) {
            throw new exceptions_1.TravellerNotFoundException(query.travelerId);
        }
        return traveller_mapper_1.TravellerMapper.toDTO(traveller);
    }
}
exports.RetrieveTravellerService = RetrieveTravellerService;
//# sourceMappingURL=retrieve-traveller.service.js.map