import { PaymentInitiationResult, PaymentStatus } from "../../../application/payments";
import { PaymentExperienceViewModel } from "../journeys/payment-experience.viewmodel";
export interface PaymentAttemptPresentation {
    readonly status: PaymentStatus;
    readonly reservationPaymentStatus: string;
    readonly balanceOutstanding: number;
}
export declare class PaymentExperienceViewModelProvider {
    provide(result: PaymentInitiationResult, journeyId?: string, simulatedSupplierFulfilment?: boolean, paymentAttempt?: PaymentAttemptPresentation): PaymentExperienceViewModel;
}
//# sourceMappingURL=payment-experience.viewmodel-provider.d.ts.map