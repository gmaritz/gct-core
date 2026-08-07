import { ReservationResult } from "../service";
import { ReservationLifecyclePresentationModel, ReservationPresentationModel, ReservationViewModel } from "./models";
import { ReservationPresentationMapper } from "./reservation-presentation-mapper";
export declare class ReservationViewModelProvider {
    private readonly mapper;
    constructor(mapper?: ReservationPresentationMapper);
    provideViewModel(reservation: ReservationPresentationModel, lifecycle: ReservationLifecyclePresentationModel): ReservationViewModel;
    mapReservationResultToViewModel(result: ReservationResult): ReservationViewModel | null;
}
//# sourceMappingURL=reservation-view-model-provider.d.ts.map