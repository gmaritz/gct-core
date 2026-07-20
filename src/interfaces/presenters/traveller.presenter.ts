/**
 * Traveller Presenter
 * 
 * Transforms Application responses into API responses.
 */
import { TravellerDTO } from '@application/dto';

export class TravellerPresenter {
  static toJSON(dto: TravellerDTO): any {
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

  static toJSONList(dtos: TravellerDTO[]): any[] {
    return dtos.map((dto) => this.toJSON(dto));
  }
}
