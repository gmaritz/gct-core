import { PaymentEngineResult } from "../engine";
import { PaymentLifecyclePresentationModel, PaymentStatusPresentationModel, PaymentSummaryPresentationModel } from "./models";
export interface PaymentPresentationOutput {
    readonly summary: PaymentSummaryPresentationModel;
    readonly lifecycle: PaymentLifecyclePresentationModel;
    readonly status: PaymentStatusPresentationModel;
}
export declare class PaymentPresentationMapper {
    map(result: PaymentEngineResult): PaymentPresentationOutput | null;
}
//# sourceMappingURL=payment-presentation-mapper.d.ts.map