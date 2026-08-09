import { Invoice } from "../../aggregate";
import { InvoiceOperation, InvoicePolicyEvaluation } from "../../policies";
import { InvoiceValidationResult } from "../../validation";
import { createInvoiceEngineError, InvoiceEngineError } from "./invoice-engine-error";

export enum InvoiceEngineOutcome {
  EXECUTED = "EXECUTED",
  REJECTED = "REJECTED",
  PENDING_ACTION = "PENDING_ACTION",
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

export function createInvoiceEngineResult(input: {
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
}): InvoiceEngineResult {
  return Object.freeze({
    success: input.success,
    operation: input.operation,
    outcome: input.outcome,
    invoice: input.invoice ?? null,
    validationResult: input.validationResult,
    policyEvaluation: input.policyEvaluation,
    financialImpact: input.financialImpact
      ? Object.freeze({
          currency: input.financialImpact.currency,
          totalObligation: input.financialImpact.totalObligation,
          previousAmountPaid: input.financialImpact.previousAmountPaid,
          newAmountPaid: input.financialImpact.newAmountPaid,
          previousBalanceDue: input.financialImpact.previousBalanceDue,
          newBalanceDue: input.financialImpact.newBalanceDue,
          previousRefundableAmount: input.financialImpact.previousRefundableAmount,
          newRefundableAmount: input.financialImpact.newRefundableAmount,
        })
      : undefined,
    errors: Object.freeze([...(input.errors ?? []).map(createInvoiceEngineError)]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      completedAt: new Date(input.metadata.completedAt.getTime()),
      version: input.metadata.version,
      requestId: input.metadata.requestId,
      source: input.metadata.source,
      stages: Object.freeze([...(input.metadata.stages ?? [])]),
    }),
  });
}
