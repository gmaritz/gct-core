import { Invoice } from "../../aggregate";
import { InvoiceOperation, InvoicePolicyEvaluation } from "../../policies";
import { InvoiceValidationResult } from "../../validation";
import { InvoiceEngineError } from "./invoice-engine-error";
export declare enum InvoiceEngineOutcome {
    EXECUTED = "EXECUTED",
    REJECTED = "REJECTED",
    PENDING_ACTION = "PENDING_ACTION"
}
export interface InvoiceFinancialImpact {
    readonly currency: string;
    readonly totalObligation: number;
    readonly previousAmountPaid: number;
    readonly newAmountPaid: number;
    readonly previousBalanceDue: number;
    readonly newBalanceDue: number;
    readonly previousRefundableAmount: number;
    readonly newRefundableAmount: number;
}
export interface InvoiceEngineResult {
    readonly success: boolean;
    readonly operation: InvoiceOperation;
    readonly outcome: InvoiceEngineOutcome;
    readonly invoice: Invoice | null;
    readonly validationResult: InvoiceValidationResult;
    readonly policyEvaluation: InvoicePolicyEvaluation;
    readonly financialImpact?: InvoiceFinancialImpact;
    readonly errors: ReadonlyArray<InvoiceEngineError>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly completedAt: Date;
        readonly version: string;
        readonly requestId: string;
        readonly source: string;
        readonly stages: ReadonlyArray<string>;
    };
}
export declare function createInvoiceEngineResult(input: {
    readonly success: boolean;
    readonly operation: InvoiceOperation;
    readonly outcome: InvoiceEngineOutcome;
    readonly invoice?: Invoice | null;
    readonly validationResult: InvoiceValidationResult;
    readonly policyEvaluation: InvoicePolicyEvaluation;
    readonly financialImpact?: InvoiceFinancialImpact;
    readonly errors?: ReadonlyArray<InvoiceEngineError>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: {
        readonly completedAt: Date;
        readonly version: string;
        readonly requestId: string;
        readonly source: string;
        readonly stages: ReadonlyArray<string>;
    };
}): InvoiceEngineResult;
//# sourceMappingURL=invoice-engine-result.d.ts.map