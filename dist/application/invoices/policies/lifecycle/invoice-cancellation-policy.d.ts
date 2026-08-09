import { InvoicePolicy } from "../contracts";
import { InvoicePolicyContext, InvoicePolicyResult } from "../models";
export declare class InvoiceCancellationPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
    evaluate(context: InvoicePolicyContext): InvoicePolicyResult;
}
//# sourceMappingURL=invoice-cancellation-policy.d.ts.map