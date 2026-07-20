/**
 * Traveller DTO (Data Transfer Object)
 * 
 * Used for transferring traveller data between layers.
 */
export interface TravellerDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
