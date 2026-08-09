import { InvoiceStatus } from "../../models";
import { InvoicePolicy } from "../contracts";
import {
  createInvoicePolicyResult,
  InvoiceOperation,
  InvoicePolicyContext,
  InvoicePolicyOutcome,
  InvoicePolicyPriority,
  InvoicePolicyResult,
  InvoiceRequiredAction,
} from "../models";

export class InvoicePaymentPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
  public evaluate(context: InvoicePolicyContext): InvoicePolicyResult {
    if (context.operation !== InvoiceOperation.ACCEPT_PAYMENT) {
      return createInvoicePolicyResult({
        policyName: "InvoicePaymentPolicy",
        outcome: InvoicePolicyOutcome.IGNORE,
        priority: InvoicePolicyPriority.LOW,
        observations: ["Payment policy does not apply to the requested operation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePaymentPolicy",
        },
      });
    }

    if (!context.invoice) {
      return createInvoicePolicyResult({
        policyName: "InvoicePaymentPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice is required to evaluate payment acceptance."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePaymentPolicy",
        },
      });
    }

    if (!context.validationResult.success) {
      return createInvoicePolicyResult({
        policyName: "InvoicePaymentPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice validation must succeed before payment policy can allow processing."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePaymentPolicy",
        },
      });
    }

    const status = context.invoice.status;

    if (status === InvoiceStatus.DRAFT) {
      return createInvoicePolicyResult({
        policyName: "InvoicePaymentPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Draft invoice cannot accept payment."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePaymentPolicy",
        },
      });
    }

    if (status === InvoiceStatus.PAID || status === InvoiceStatus.CANCELLED || status === InvoiceStatus.VOID) {
      return createInvoicePolicyResult({
        policyName: "InvoicePaymentPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: [`Invoice in status '${status}' cannot accept payment.`],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePaymentPolicy",
        },
      });
    }

    const warnings = status === InvoiceStatus.OVERDUE ? ["Invoice is overdue."] : [];
    if (context.reviewRequirements?.paymentReviewRequired) {
      return createInvoicePolicyResult({
        policyName: "InvoicePaymentPolicy",
        outcome: InvoicePolicyOutcome.REQUIRE_ACTION,
        priority: InvoicePolicyPriority.HIGH,
        requiredActions: [InvoiceRequiredAction.PAYMENT_REVIEW],
        warnings,
        observations: ["Payment review is required before payment acceptance."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePaymentPolicy",
        },
      });
    }

    return createInvoicePolicyResult({
      policyName: "InvoicePaymentPolicy",
      outcome: InvoicePolicyOutcome.ALLOW,
      priority: InvoicePolicyPriority.NORMAL,
      warnings,
      observations: ["Invoice may accept payment."],
      metadata: {
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "InvoicePaymentPolicy",
      },
    });
  }
}