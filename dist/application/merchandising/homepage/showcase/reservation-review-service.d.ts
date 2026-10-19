import { GuestInformationInput, DefaultGuestInformationService } from "./guest-information-service";
import { GuestInformationStore } from "./guest-information-store";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { DefaultJourneyQuoteService, JourneyQuoteResult } from "./journey-quote-service";
export type ReservationReviewStatus = "READY" | "INVALID" | "RECHECK_REQUIRED" | "UNAVAILABLE";
export interface ReservationReviewRequest {
    readonly ownerId: string;
    readonly journeyId: string;
    readonly confirmed?: boolean;
}
export interface ReservationReviewResult {
    readonly status: ReservationReviewStatus;
    readonly journeyId: string;
    readonly journey?: JourneyQuoteResult["journey"];
    readonly quote?: JourneyQuoteResult;
    readonly guestInformation?: GuestInformationInput;
    readonly errors: ReadonlyArray<string>;
    readonly confirmed: boolean;
}
export interface ReservationReviewService {
    review(request: ReservationReviewRequest): Promise<ReservationReviewResult>;
}
export declare class DefaultReservationReviewService implements ReservationReviewService {
    private readonly resolver;
    private readonly guestService;
    private readonly quoteService;
    private readonly guestStore;
    constructor(resolver?: DynamicHomepageJourneyResolver, guestService?: DefaultGuestInformationService, quoteService?: DefaultJourneyQuoteService, guestStore?: GuestInformationStore);
    review(request: ReservationReviewRequest): Promise<ReservationReviewResult>;
}
//# sourceMappingURL=reservation-review-service.d.ts.map