"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravellerMapper = void 0;
/**
 * Traveller Mapper
 *
 * Maps between Traveller aggregate and TravellerDTO.
 */
const aggregates_1 = require("@domain/aggregates");
class TravellerMapper {
    static toPersistence(traveller, customerId) {
        return {
            id: traveller.getId(),
            customerId,
            firstName: traveller.getFirstName(),
            lastName: traveller.getLastName(),
            preferences: traveller.getPreferences(),
            createdAt: traveller.getCreatedAt(),
            updatedAt: traveller.getUpdatedAt(),
        };
    }
    static toDTO(traveller) {
        return {
            id: traveller.getId(),
            firstName: traveller.getFirstName(),
            lastName: traveller.getLastName(),
            email: traveller.getEmail(),
            preferences: traveller.getPreferences(),
            createdAt: traveller.getCreatedAt(),
            updatedAt: traveller.getUpdatedAt(),
        };
    }
    static toDomain(raw) {
        return aggregates_1.Traveller.restore(raw.id, raw.firstName, raw.lastName, raw.customer.email, raw.preferences ?? {}, raw.createdAt, raw.updatedAt);
    }
}
exports.TravellerMapper = TravellerMapper;
//# sourceMappingURL=traveller.mapper.js.map