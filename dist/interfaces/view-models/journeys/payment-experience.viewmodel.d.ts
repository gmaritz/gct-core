import { CTAViewModel } from "../shared/cta.viewmodel";
export type PaymentExperienceStatus = "UNAVAILABLE" | "INITIATED" | "PENDING" | "FAILED" | "COMPLETED" | "CANCELLED" | "UNKNOWN";
export interface PaymentExperienceViewModel {
    readonly journeyId: string;
    readonly reservationReference?: string;
    readonly amount?: number;
    readonly currency?: string;
    readonly status: PaymentExperienceStatus;
    readonly message: string;
    readonly providerAction?: CTAViewModel;
    readonly hostedPaymentAction?: {
        readonly method: "GET" | "POST";
        readonly action: string;
        readonly fields: Readonly<Record<string, string>>;
    };
    readonly recoveryAction: CTAViewModel;
}
//# sourceMappingURL=payment-experience.viewmodel.d.ts.map