import { InvoicePolicyContext, InvoicePolicyEvaluation } from "./models";
import { InvoicePolicyRegistry } from "./registry";
export declare class InvoicePolicyPipeline {
    private readonly registry;
    constructor(registry?: InvoicePolicyRegistry);
    evaluate(context: InvoicePolicyContext): InvoicePolicyEvaluation;
    private aggregate;
}
//# sourceMappingURL=invoice-policy-pipeline.d.ts.map