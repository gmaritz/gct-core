import { ReservationStatus } from "../../aggregate";
import { ReservationTimelineMilestone } from "../../models";
export interface ReservationTimelinePresentationEntry {
    readonly milestone: ReservationTimelineMilestone;
    readonly occurredAt: Date;
    readonly note?: string;
}
export interface ReservationBookingProgressPresentation {
    readonly stage: string;
    readonly percentage: number;
}
export interface ReservationPaymentProgressPresentation {
    readonly paidAmount: number;
    readonly outstandingAmount: number;
    readonly complete: boolean;
}
export interface ReservationLifecyclePresentationMetadata {
    readonly generatedAt: Date;
    readonly version: string;
    readonly requestId: string;
}
export interface ReservationLifecyclePresentationModel {
    readonly status: ReservationStatus;
    readonly bookingProgress: ReservationBookingProgressPresentation;
    readonly paymentProgress: ReservationPaymentProgressPresentation;
    readonly outstandingActions: ReadonlyArray<string>;
    readonly timelineSummary: ReadonlyArray<ReservationTimelinePresentationEntry>;
    readonly nextRecommendedAction: string;
    readonly metadata: ReservationLifecyclePresentationMetadata;
}
export declare function createReservationLifecyclePresentationModel(model: ReservationLifecyclePresentationModel): ReservationLifecyclePresentationModel;
//# sourceMappingURL=reservation-lifecycle-presentation-model.d.ts.map