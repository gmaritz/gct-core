import { Invoice } from "../../aggregate";
import { InvoiceValidationResult } from "../../validation";
import { InvoiceOperation } from "./invoice-operation";

export interface InvoicePolicyReviewRequirements {
  readonly paymentReviewRequired?: boolean;
  readonly cancellationReviewRequired?: boolean;
  readonly accountingReviewRequired?: boolean;
}

export interface InvoicePolicyContext {
  readonly operation: InvoiceOperation;
  readonly validationResult: InvoiceValidationResult;
  readonly invoice?: Invoice | null;
  readonly reviewRequirements?: InvoicePolicyReviewRequirements;
}

export function createInvoicePolicyContext(context: InvoicePolicyContext): InvoicePolicyContext {
  return Object.freeze({
    operation: context.operation,
    validationResult: context.validationResult,
    invoice: context.invoice,
    reviewRequirements: context.reviewRequirements
      ? Object.freeze({
          paymentReviewRequired: context.reviewRequirements.paymentReviewRequired,
          cancellationReviewRequired: context.reviewRequirements.cancellationReviewRequired,
          accountingReviewRequired: context.reviewRequirements.accountingReviewRequired,
        })
      : undefined,
  });
}