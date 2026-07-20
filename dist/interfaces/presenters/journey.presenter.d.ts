/**
 * Journey Presenter
 *
 * Transforms Application responses into API responses.
 */
import { JourneyDTO } from '@application/dto';
export declare class JourneyPresenter {
    static toJSON(dto: JourneyDTO): any;
    static toJSONList(dtos: JourneyDTO[]): any[];
    private static calculateDurationDays;
}
//# sourceMappingURL=journey.presenter.d.ts.map