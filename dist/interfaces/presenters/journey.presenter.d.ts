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
export declare class JourneyPresenter {
    static toJSON(dto: JourneyDTO): JourneyJSONResponse;
    static toJSONList(dtos: JourneyDTO[]): JourneyJSONResponse[];
    private static calculateDurationDays;
}
//# sourceMappingURL=journey.presenter.d.ts.map