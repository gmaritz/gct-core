import { InvoicePolicy } from "../contracts";
import { InvoicePolicyContext, InvoicePolicyResult } from "../models";
export declare class InvoicePaymentPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
    evaluate(context: InvoicePolicyContext): InvoicePolicyResult;
}
//# sourceMappingURL=invoice-payment-policy.d.ts.map