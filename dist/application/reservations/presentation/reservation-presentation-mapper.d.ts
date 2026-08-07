import { ReservationResult } from "../service";
import { ReservationLifecyclePresentationModel, ReservationPresentationModel } from "./models";
export interface ReservationPresentationOutput {
    readonly reservation: ReservationPresentationModel;
    readonly lifecycle: ReservationLifecyclePresentationModel;
}
export declare class ReservationPresentationMapper {
    map(result: ReservationResult): ReservationPresentationOutput | null;
    mapFromResult(result: ReservationResult): ReservationPresentationModel | null;
}
//# sourceMappingURL=reservation-presentation-mapper.d.ts.map