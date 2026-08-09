import { InvoicePolicy } from "../contracts";
import { InvoicePolicyContext, InvoicePolicyResult } from "../models";
export declare class InvoiceIssuePolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
    evaluate(context: InvoicePolicyContext): InvoicePolicyResult;
}
//# sourceMappingURL=invoice-issue-policy.d.ts.map