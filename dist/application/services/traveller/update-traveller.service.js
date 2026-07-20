"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTravellerService = void 0;
const exceptions_1 = require("@domain/exceptions");
const traveller_mapper_1 = require("../../mappers/traveller.mapper");
/**
 * UpdateTravellerService
 *
 * Orchestrates updates to an existing traveller's profile.
 * Profile validation remains within the Traveller aggregate.
 */
class UpdateTravellerService {
    constructor(travellerRepository) {
        this.travellerRepository = travellerRepository;
    }
    async execute(command) {
        const traveller = await this.travellerRepository.findById(command.travelerId);
        if (!traveller) {
            throw new exceptions_1.TravellerNotFoundException(command.travelerId);
        }
        traveller.updateProfile(command.firstName, command.lastName);
        await this.travellerRepository.save(traveller);
        // Domain events (TravellerProfileUpdatedEvent) are available here for publishing.
        traveller.clearDomainEvents();
        return traveller_mapper_1.TravellerMapper.toDTO(traveller);
    }
}
exports.UpdateTravellerService = UpdateTravellerService;
//# sourceMappingURL=update-traveller.service.js.map