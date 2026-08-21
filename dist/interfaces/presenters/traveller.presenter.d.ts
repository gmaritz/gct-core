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
export declare class TravellerPresenter {
    static toJSON(dto: TravellerDTO): TravellerJSONResponse;
    static toJSONList(dtos: TravellerDTO[]): TravellerJSONResponse[];
}
//# sourceMappingURL=traveller.presenter.d.ts.map