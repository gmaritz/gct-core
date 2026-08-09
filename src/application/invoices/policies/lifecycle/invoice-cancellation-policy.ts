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

export class InvoiceCancellationPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
  public evaluate(context: InvoicePolicyContext): InvoicePolicyResult {
    if (context.operation !== InvoiceOperation.CANCEL) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCancellationPolicy",
        outcome: InvoicePolicyOutcome.IGNORE,
        priority: InvoicePolicyPriority.LOW,
        observations: ["Cancellation policy does not apply to the requested operation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCancellationPolicy",
        },
      });
    }

    if (!context.invoice) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCancellationPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice is required to evaluate a cancellation request."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCancellationPolicy",
        },
      });
    }

    if (!context.validationResult.success) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCancellationPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice validation must succeed before cancellation policy can allow processing."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCancellationPolicy",
        },
      });
    }

    const status = context.invoice.status;

    if (status === InvoiceStatus.PAID) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCancellationPolicy",
        outcome: InvoicePolicyOutcome.REQUIRE_ACTION,
        priority: InvoicePolicyPriority.HIGH,
        requiredActions: [InvoiceRequiredAction.CANCELLATION_REVIEW],
        observations: ["Paid invoice cancellation requires cancellation review."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCancellationPolicy",
        },
      });
    }

    if (status === InvoiceStatus.PARTIALLY_PAID && context.reviewRequirements?.cancellationReviewRequired) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCancellationPolicy",
        outcome: InvoicePolicyOutcome.REQUIRE_ACTION,
        priority: InvoicePolicyPriority.HIGH,
        requiredActions: [InvoiceRequiredAction.CANCELLATION_REVIEW],
        observations: ["Partially paid invoice cancellation requires cancellation review."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCancellationPolicy",
        },
      });
    }

    if (status === InvoiceStatus.CANCELLED || status === InvoiceStatus.VOID) {
      return createInvoicePolicyResult({
        policyName: "InvoiceCancellationPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: [`Invoice in status '${status}' cannot be cancelled.`],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceCancellationPolicy",
        },
      });
    }

    return createInvoicePolicyResult({
      policyName: "InvoiceCancellationPolicy",
      outcome: InvoicePolicyOutcome.ALLOW,
      priority: InvoicePolicyPriority.NORMAL,
      observations: ["Invoice cancellation is permitted for current status."],
      metadata: {
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "InvoiceCancellationPolicy",
      },
    });
  }
}