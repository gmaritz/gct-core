/**
 * Traveller Mapper
 *
 * Maps between Traveller aggregate and TravellerDTO.
 */
import { Traveller } from '@domain/aggregates';
import { TravellerDTO } from '../dto/traveller.dto';
export declare class TravellerMapper {
    static toPersistence(traveller: Traveller): any;
    static toDTO(traveller: Traveller): TravellerDTO;
    static toDomain(raw: any): Traveller;
}
//# sourceMappingURL=traveller.mapper.d.ts.map