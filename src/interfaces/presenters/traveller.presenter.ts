/**
 * Traveller Presenter
 * 
 * Transforms Application responses into API responses.
 */
import { TravellerDTO } from '@application/dto';

export interface TravellerJSONResponse {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
  readonly preferences: TravellerDTO["preferences"];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class TravellerPresenter {
  static toJSON(dto: TravellerDTO): TravellerJSONResponse {
    return {
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
      preferences: dto.preferences,
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  static toJSONList(dtos: TravellerDTO[]): TravellerJSONResponse[] {
    return dtos.map((dto) => this.toJSON(dto));
  }
}
