/**
 * Journey DTO (Data Transfer Object)
 *
 * Used for transferring journey data between layers.
 */
export interface JourneyDTO {
    id: string;
    journeyCode: string;
    travelerId: string;
    name: string;
    description: string;
    status: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    finalizedAt: Date | null;
}
//# sourceMappingURL=journey.dto.d.ts.map