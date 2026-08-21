/**
 * Journey Presenter
 * 
 * Transforms Application responses into API responses.
 */
import { JourneyDTO } from '@application/dto';

export interface JourneyJSONResponse {
  readonly id: string;
  readonly journeyCode: string;
  readonly travelerId: string;
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly dateRange: {
    readonly startDate: string;
    readonly endDate: string;
  };
  readonly durationDays: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly finalizedAt: string | null;
}

export class JourneyPresenter {
  static toJSON(dto: JourneyDTO): JourneyJSONResponse {
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

  static toJSONList(dtos: JourneyDTO[]): JourneyJSONResponse[] {
    return dtos.map((dto) => this.toJSON(dto));
  }

  private static calculateDurationDays(startDate: Date, endDate: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);
  }
}
