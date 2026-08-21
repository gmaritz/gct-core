/**
 * Traveller Mapper
 * 
 * Maps between Traveller aggregate and TravellerDTO.
 */
import { Traveller } from '@domain/aggregates';
import { TravellerPreferences } from '@domain/shared';
import { TravellerDTO } from '../dto/traveller.dto';

export interface TravellerPersistenceInput {
  readonly id: string;
  readonly customerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly preferences: TravellerPreferences;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TravellerPersistenceRecord {
  readonly id: string;
  readonly customerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly preferences: TravellerPreferences | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly customer: {
    readonly email: string;
  };
}

export class TravellerMapper {
  static toPersistence(traveller: Traveller, customerId: string): TravellerPersistenceInput {
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

  static toDomain(raw: TravellerPersistenceRecord): Traveller {
    return Traveller.restore(
      raw.id,
      raw.firstName,
      raw.lastName,
      raw.customer.email,
      raw.preferences ?? {},
      raw.createdAt,
      raw.updatedAt
    );
  }
}
