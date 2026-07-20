/**
 * Journey Mapper
 * 
 * Maps between Journey aggregate and JourneyDTO.
 */
import { Journey, JourneyStatus } from '@domain/aggregates';
import { DateRange } from '@domain/value-objects';
import { JourneyDTO } from '../dto/journey.dto';

export class JourneyMapper {
  static toPersistence(journey: Journey): any {
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

  static toDTO(journey: Journey): JourneyDTO {
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

  static toDomain(raw: any): Journey {
    const dateRange = DateRange.create(raw.startDate, raw.endDate);
    return Journey.restore(
      raw.id,
      raw.journeyCode,
      raw.travelerId,
      raw.name,
      raw.description,
      raw.status as JourneyStatus,
      dateRange,
      raw.createdAt,
      raw.updatedAt,
      raw.finalizedAt
    );
  }
}
