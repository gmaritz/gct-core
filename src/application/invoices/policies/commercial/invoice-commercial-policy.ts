import { InvoiceValidationErrorCode } from "../../validation";
import { InvoicePolicy } from "../contracts";
import {
  createInvoicePolicyResult,
  InvoiceOperation,
  InvoicePolicyContext,
  InvoicePolicyOutcome,
  InvoicePolicyPriority,
  InvoicePolicyResult,
} from "../models";

const commercialErrorCodes = new Set<InvoiceValidationErrorCode>([
  InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE,
  InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT,
  InvoiceValidationErrorCode.MISSING_FINANCIAL_OBLIGATION,
  InvoiceValidationErrorCode.INVALID_CURRENCY,
  InvoiceValidationErrorCode.INVALID_TOTAL_AMOUNT,
  InvoiceValidationErrorCode.QUOTE_REFERENCE_INCONSISTENT,
  InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT,
  InvoiceValidationErrorCode.PRICING_CURRENCY_MISMATCH,
  InvoiceValidationErrorCode.PRICING_TOTAL_MISMATCH,
]);

const commercialOperations = new Set<InvoiceOperation>([
  InvoiceOperation.ISSUE,
  InvoiceOperation.ACCEPT_PAYMENT,
  InvoiceOperation.CANCEL,
  InvoiceOperation.VOID,
  InvoiceOperation.REFUND,
]);

export class InvoiceCommercialPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
  public evaluate(context: InvoicePolicyContext): InvoicePolicyResult {
    if (!commercialOperations.has(context.operation)) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCommercialPolicy",
        outcome: InvoicePolicyOutcome.IGNORE,
        priority: InvoicePolicyPriority.LOW,
        observations: ["Commercial policy does not apply to the requested operation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCommercialPolicy",
        },
      });
    }

    if (!context.validationResult.success) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCommercialPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.CRITICAL,
        errors: ["Invoice validation must succeed before commercial policy evaluation can allow processing."],
        observations: ["Commercial policy interpreted validation failure as a commercial deny condition."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCommercialPolicy",
        },
      });
    }

    const hasCriticalCommercialError = context.validationResult.errors.some(
      (error) => error.severity === "CRITICAL" && commercialErrorCodes.has(error.code),
    );
    if (hasCriticalCommercialError) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCommercialPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.CRITICAL,
        errors: ["Commercial validation reported a critical failure for this invoice."],
        observations: ["Commercial policy denied operation based on validation-commercial incompatibility."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCommercialPolicy",
        },
      });
    }

    const invoice = context.invoice;
    if (!invoice) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCommercialPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice is required for commercial policy evaluation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCommercialPolicy",
        },
      });
    }

    const quoteMissing = invoice.quoteReference.quoteId.trim().length === 0 || invoice.quoteReference.quoteVersion.trim().length === 0;
    const pricingMissing = invoice.pricingSnapshot.snapshotId.trim().length === 0
      || invoice.pricingSnapshot.pricingId.trim().length === 0
      || invoice.pricingSnapshot.version.trim().length === 0;
    const obligationMissing = invoice.financialObligation.currency.trim().length === 0;
    const commercialInconsistent =
      invoice.pricingSnapshot.currency !== invoice.financialObligation.currency
      || invoice.pricingSnapshot.totalAmount !== invoice.financialObligation.totalAmount;

    if (quoteMissing || pricingMissing || obligationMissing || commercialInconsistent) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCommercialPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice commercial state is inconsistent for the requested operation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCommercialPolicy",
        },
      });
    }

    return createInvoicePolicyResult({
      policyName: "InvoiceCommercialPolicy",
      outcome: InvoicePolicyOutcome.ALLOW,
      priority: InvoicePolicyPriority.NORMAL,
      observations: ["Commercial integrity checks passed for the requested operation."],
      metadata: {
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "InvoiceCommercialPolicy",
      },
    });
  }
}