import { PaymentLifecyclePresentationModel } from "./payment-lifecycle-presentation-model";
import { PaymentStatusPresentationModel } from "./payment-status-presentation-model";
import { PaymentSummaryPresentationModel } from "./payment-summary-presentation-model";
export interface PaymentViewModel {
    readonly summary: PaymentSummaryPresentationModel;
    readonly lifecycle: PaymentLifecyclePresentationModel;
    readonly status: PaymentStatusPresentationModel;
    readonly cta: {
        readonly label: string;
        readonly href: string;
        readonly style: "primary" | "secondary" | "neutral";
    };
    readonly badgeStyles: {
        readonly statusBadge: "success" | "warning" | "neutral";
        readonly paymentMethodBadge: "info" | "neutral";
    };
    readonly displayLabels: {
        readonly totalLabel: string;
        readonly statusLabel: string;
        readonly lifecycleLabel: string;
    };
    readonly metadata: {
        readonly generatedAt: Date;
        readonly version: string;
        readonly requestId: string;
    };
}
export declare function createPaymentViewModel(viewModel: PaymentViewModel): PaymentViewModel;
//# sourceMappingURL=payment-view-model.d.ts.map