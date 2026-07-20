/**
 * Journey Mapper
 *
 * Maps between Journey aggregate and JourneyDTO.
 */
import { Journey } from '@domain/aggregates';
import { JourneyDTO } from '../dto/journey.dto';
export declare class JourneyMapper {
    static toPersistence(journey: Journey): any;
    static toDTO(journey: Journey): JourneyDTO;
    static toDomain(raw: any): Journey;
}
//# sourceMappingURL=journey.mapper.d.ts.map