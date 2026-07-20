/**
 * Traveller Mapper
 * 
 * Maps between Traveller aggregate and TravellerDTO.
 */
import { Traveller } from '@domain/aggregates';
import { TravellerDTO } from '../dto/traveller.dto';

export class TravellerMapper {
  static toPersistence(traveller: Traveller): any {
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

  static toDTO(traveller: Traveller): TravellerDTO {
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

  static toDomain(raw: any): Traveller {
    return Traveller.restore(
      raw.id,
      raw.firstName,
      raw.lastName,
      raw.email,
      raw.preferences,
      raw.createdAt,
      raw.updatedAt
    );
  }
}
