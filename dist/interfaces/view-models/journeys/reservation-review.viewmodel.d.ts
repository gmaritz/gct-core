import { CTAViewModel } from "../shared/cta.viewmodel";
export interface ReservationReviewViewModel {
    readonly journeyId: string;
    readonly journeyTitle: string;
    readonly destination: string;
    readonly duration: string;
    readonly accommodation: ReadonlyArray<{
        readonly destination: string;
        readonly property: string;
        readonly room: string;
        readonly rate: string;
    }>;
    readonly contact: {
        readonly email: string;
        readonly phone?: string;
    };
    readonly travellers: ReadonlyArray<{
        readonly name: string;
        readonly email: string;
        readonly travellerType: string;
    }>;
    readonly quote?: {
        readonly total: string;
        readonly currency: string;
        readonly breakdown: ReadonlyArray<{
            readonly label: string;
            readonly value: string;
        }>;
    };
    readonly status: "READY" | "INVALID" | "RECHECK_REQUIRED" | "UNAVAILABLE";
    readonly errors: ReadonlyArray<string>;
    readonly confirmationAction?: CTAViewModel;
    readonly accommodationHref: string;
    readonly guestInformationHref: string;
}
//# sourceMappingURL=reservation-review.viewmodel.d.ts.map