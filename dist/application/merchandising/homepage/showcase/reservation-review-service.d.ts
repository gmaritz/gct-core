import { GuestInformationInput, DefaultGuestInformationService } from "./guest-information-service";
import { GuestInformationStore } from "./guest-information-store";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { DefaultJourneyQuoteService, JourneyQuoteResult } from "./journey-quote-service";
import { InitialPaymentRequirement } from "./signature-cape-winelands-initial-payment-calculator";
export type ReservationReviewStatus = "READY" | "INVALID" | "RECHECK_REQUIRED" | "UNAVAILABLE";
export interface ReservationReviewRequest {
    readonly ownerId: string;
    readonly journeyId: string;
    readonly confirmed?: boolean;
    readonly acceptanceToken?: string;
}
export interface ReservationReviewResult {
    readonly status: ReservationReviewStatus;
    readonly journeyId: string;
    readonly journey?: JourneyQuoteResult["journey"];
    readonly quote?: JourneyQuoteResult;
    readonly guestInformation?: GuestInformationInput;
    readonly initialPaymentRequirement?: InitialPaymentRequirement;
    readonly acceptanceToken?: string;
    readonly errors: ReadonlyArray<string>;
    readonly confirmed: boolean;
}
export interface ReservationReviewService {
    review(request: ReservationReviewRequest): Promise<ReservationReviewResult>;
}
export declare class ReservationReviewAcceptanceStore {
    private readonly lifetimeMilliseconds;
    private readonly acceptances;
    constructor(lifetimeMilliseconds?: number);
    issue(ownerId: string, journeyId: string, fingerprint: string, now?: number): string;
    matches(token: string | undefined, ownerId: string, journeyId: string, fingerprint: string, now?: number): boolean;
    consume(token: string | undefined, ownerId: string, journeyId: string): void;
}
export declare const reservationReviewAcceptanceStore: ReservationReviewAcceptanceStore;
export declare class DefaultReservationReviewService implements ReservationReviewService {
    private readonly resolver;
    private readonly guestService;
    private readonly quoteService;
    private readonly guestStore;
    private readonly acceptanceStore;
    private readonly now;
    constructor(resolver?: DynamicHomepageJourneyResolver, guestService?: DefaultGuestInformationService, quoteService?: DefaultJourneyQuoteService, guestStore?: GuestInformationStore, acceptanceStore?: ReservationReviewAcceptanceStore, now?: () => Date);
    review(request: ReservationReviewRequest): Promise<ReservationReviewResult>;
}
//# sourceMappingURL=reservation-review-service.d.ts.map