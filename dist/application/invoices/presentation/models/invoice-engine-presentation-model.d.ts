import { InvoiceEngineOutcome } from "../../engine";
import { InvoiceOperation } from "../../policies";
import { InvoicePolicyOutcome, InvoiceRequiredAction } from "../../policies";
import { InvoicePresentationTarget } from "./invoice-presentation-context";
export interface InvoiceEnginePresentationModel {
    readonly operation: InvoiceOperation;
    readonly outcome: InvoiceEngineOutcome;
    readonly policyOutcome: InvoicePolicyOutcome;
    readonly requiredActions: ReadonlyArray<InvoiceRequiredAction>;
    readonly warnings: ReadonlyArray<string>;
    readonly errors: ReadonlyArray<string>;
    readonly financialImpact?: {
        readonly currency: string;
        readonly totalObligation: number;
        readonly totalObligationDisplay: string;
        readonly previousAmountPaid: number;
        readonly previousAmountPaidDisplay: string;
        readonly newAmountPaid: number;
        readonly newAmountPaidDisplay: string;
        readonly previousBalanceDue: number;
        readonly previousBalanceDueDisplay: string;
        readonly newBalanceDue: number;
        readonly newBalanceDueDisplay: string;
        readonly previousRefundableAmount: number;
        readonly previousRefundableAmountDisplay: string;
        readonly newRefundableAmount: number;
        readonly newRefundableAmountDisplay: string;
    };
    readonly metadata: {
        readonly completedAt: Date;
        readonly completedAtDisplay: string;
        readonly requestId: string;
        readonly source: string;
        readonly version: string;
        readonly stages: ReadonlyArray<string>;
        readonly target: InvoicePresentationTarget;
    };
}
export declare function createInvoiceEnginePresentationModel(model: InvoiceEnginePresentationModel): InvoiceEnginePresentationModel;
//# sourceMappingURL=invoice-engine-presentation-model.d.ts.map