export interface ReservationJourneyPresentationSummary {
    readonly journeyId: string;
    readonly title: string;
    readonly destination: string;
    readonly duration: string;
}
export interface ReservationTravellerPresentationSummary {
    readonly travellerCount: number;
    readonly leadTraveller: string;
}
export interface ReservationPricingPresentationSummary {
    readonly amount: number;
    readonly currency: string;
    readonly display: string;
}
export interface ReservationPaymentPresentationSummary {
    readonly paymentStatus: string;
    readonly amountReceived: number;
    readonly balanceOutstanding: number;
    readonly progressLabel: string;
}
export interface ReservationPresentationMetadata {
    readonly generatedAt: Date;
    readonly version: string;
    readonly requestId: string;
}
export interface ReservationPresentationModel {
    readonly reservationNumber: string;
    readonly journey: ReservationJourneyPresentationSummary;
    readonly travellers: ReservationTravellerPresentationSummary;
    readonly accommodationSummary: string;
    readonly pricingSummary?: ReservationPricingPresentationSummary;
    readonly paymentSummary?: ReservationPaymentPresentationSummary;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: ReservationPresentationMetadata;
}
export declare function createReservationPresentationModel(model: ReservationPresentationModel): ReservationPresentationModel;
//# sourceMappingURL=reservation-presentation-model.d.ts.map