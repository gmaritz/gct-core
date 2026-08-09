import { InvoicePolicy } from "../contracts";
import { InvoicePolicyContext, InvoicePolicyResult } from "../models";
export declare class InvoiceVoidPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
    evaluate(context: InvoicePolicyContext): InvoicePolicyResult;
}
//# sourceMappingURL=invoice-void-policy.d.ts.map