import { PaymentEngineResult } from "../engine";
import { PaymentLifecyclePresentationModel, PaymentStatusPresentationModel, PaymentSummaryPresentationModel, PaymentViewModel } from "./models";
import { PaymentPresentationMapper } from "./payment-presentation-mapper";
export declare class PaymentViewModelProvider {
    private readonly mapper;
    constructor(mapper?: PaymentPresentationMapper);
    provideViewModel(summary: PaymentSummaryPresentationModel, lifecycle: PaymentLifecyclePresentationModel, status: PaymentStatusPresentationModel, requestId: string): PaymentViewModel;
    mapPaymentResultToViewModel(result: PaymentEngineResult): PaymentViewModel | null;
}
//# sourceMappingURL=payment-view-model-provider.d.ts.map