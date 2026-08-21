/**
 * Traveller DTO (Data Transfer Object)
 *
 * Used for transferring traveller data between layers.
 */
import { TravellerPreferences } from '@domain/shared';
export interface TravellerDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    preferences: TravellerPreferences;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=traveller.dto.d.ts.map