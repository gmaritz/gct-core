/**
 * Journey Presenter
 * 
 * Transforms Application responses into API responses.
 */
import { JourneyDTO } from '@application/dto';

export class JourneyPresenter {
  static toJSON(dto: JourneyDTO): any {
    return {
      id: dto.id,
      journeyCode: dto.journeyCode,
      travelerId: dto.travelerId,
      name: dto.name,
      description: dto.description,
      status: dto.status,
      dateRange: {
        startDate: dto.startDate.toISOString(),
        endDate: dto.endDate.toISOString(),
      },
      durationDays: this.calculateDurationDays(dto.startDate, dto.endDate),
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
      finalizedAt: dto.finalizedAt?.toISOString() || null,
    };
  }

  static toJSONList(dtos: JourneyDTO[]): any[] {
    return dtos.map((dto) => this.toJSON(dto));
  }

  private static calculateDurationDays(startDate: Date, endDate: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);
  }
}
