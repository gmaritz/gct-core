"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyMapper = void 0;
/**
 * Journey Mapper
 *
 * Maps between Journey aggregate and JourneyDTO.
 */
const aggregates_1 = require("@domain/aggregates");
const value_objects_1 = require("@domain/value-objects");
class JourneyMapper {
    static toPersistence(journey) {
        const dateRange = journey.getDateRange();
        return {
            id: journey.getId(),
            journeyCode: journey.getJourneyCode(),
            travelerId: journey.getTravelerId(),
            name: journey.getName(),
            description: journey.getDescription(),
            status: journey.getStatus(),
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            createdAt: journey.getCreatedAt(),
            updatedAt: journey.getUpdatedAt(),
            finalizedAt: journey.getFinalizedAt(),
        };
    }
    static toDTO(journey) {
        const dateRange = journey.getDateRange();
        return {
            id: journey.getId(),
            journeyCode: journey.getJourneyCode(),
            travelerId: journey.getTravelerId(),
            name: journey.getName(),
            description: journey.getDescription(),
            status: journey.getStatus(),
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            createdAt: journey.getCreatedAt(),
            updatedAt: journey.getUpdatedAt(),
            finalizedAt: journey.getFinalizedAt(),
        };
    }
    static toDomain(raw) {
        const dateRange = value_objects_1.DateRange.create(raw.startDate, raw.endDate);
        return aggregates_1.Journey.restore(raw.id, raw.journeyCode, raw.travelerId, raw.name, raw.description, raw.status, dateRange, raw.createdAt, raw.updatedAt, raw.finalizedAt);
    }
}
exports.JourneyMapper = JourneyMapper;
//# sourceMappingURL=journey.mapper.js.map