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
export declare class TravellerMapper {
    static toPersistence(traveller: Traveller, customerId: string): TravellerPersistenceInput;
    static toDTO(traveller: Traveller): TravellerDTO;
    static toDomain(raw: TravellerPersistenceRecord): Traveller;
}
//# sourceMappingURL=traveller.mapper.d.ts.map