import { ReservationStatus } from "../../aggregate";
export interface ReservationViewModelPayment {
    readonly status: string;
    readonly progress: string;
}
export interface ReservationViewModelNextAction {
    readonly label: string;
    readonly href: string;
    readonly style: string;
}
export interface ReservationViewModelMetadata {
    readonly generatedAt: Date;
    readonly version: string;
    readonly requestId: string;
}
export interface ReservationViewModel {
    readonly id: string;
    readonly title: string;
    readonly subtitle: string;
    readonly status: ReservationStatus;
    readonly statusBadgeStyle: string;
    readonly travellers: string;
    readonly accommodationSummary: string;
    readonly pricingSummary: string;
    readonly payment: ReservationViewModelPayment;
    readonly timelineHeadline: string;
    readonly outstandingActions: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
    readonly nextAction: ReservationViewModelNextAction;
    readonly metadata: ReservationViewModelMetadata;
}
export declare function createReservationViewModel(model: ReservationViewModel): ReservationViewModel;
//# sourceMappingURL=reservation-view-model.d.ts.map