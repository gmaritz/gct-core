import { InvoicePolicy } from "../contracts";
import { InvoicePolicyContext, InvoicePolicyPriority, InvoicePolicyResult } from "../models";
export interface RegisteredInvoicePolicy {
    readonly name: string;
    readonly priority: InvoicePolicyPriority;
    readonly policy: InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult>;
}
export declare class InvoicePolicyRegistry {
    private readonly policies;
    private registrationSequence;
    constructor(registerDefaults?: boolean);
    register(name: string, policy: InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult>, priority?: InvoicePolicyPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredInvoicePolicy | undefined;
    resolveAll(): ReadonlyArray<RegisteredInvoicePolicy>;
    private registerDefaults;
}
//# sourceMappingURL=invoice-policy-registry.d.ts.map