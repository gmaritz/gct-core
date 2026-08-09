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

export class InvoiceVoidPolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
  public evaluate(context: InvoicePolicyContext): InvoicePolicyResult {
    if (context.operation !== InvoiceOperation.VOID) {
      return createInvoicePolicyResult({
        policyName: "InvoiceVoidPolicy",
        outcome: InvoicePolicyOutcome.IGNORE,
        priority: InvoicePolicyPriority.LOW,
        observations: ["Void policy does not apply to the requested operation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceVoidPolicy",
        },
      });
    }

    if (!context.invoice) {
      return createInvoicePolicyResult({
        policyName: "InvoiceVoidPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice is required to evaluate a void request."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceVoidPolicy",
        },
      });
    }

    if (!context.validationResult.success) {
      return createInvoicePolicyResult({
        policyName: "InvoiceVoidPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice validation must succeed before void policy can allow processing."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceVoidPolicy",
        },
      });
    }

    const status = context.invoice.status;

    if (status === InvoiceStatus.DRAFT || status === InvoiceStatus.ISSUED) {
      return createInvoicePolicyResult({
        policyName: "InvoiceVoidPolicy",
        outcome: InvoicePolicyOutcome.ALLOW,
        priority: InvoicePolicyPriority.NORMAL,
        observations: ["Invoice may be voided in current status."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceVoidPolicy",
        },
      });
    }

    if (status === InvoiceStatus.PARTIALLY_PAID || status === InvoiceStatus.OVERDUE) {
      return createInvoicePolicyResult({
        policyName: "InvoiceVoidPolicy",
        outcome: InvoicePolicyOutcome.REQUIRE_ACTION,
        priority: InvoicePolicyPriority.HIGH,
        requiredActions: [InvoiceRequiredAction.FINANCIAL_REVIEW],
        observations: ["Void request requires financial review for this invoice state."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceVoidPolicy",
        },
      });
    }

    return createInvoicePolicyResult({
      policyName: "InvoiceVoidPolicy",
      outcome: InvoicePolicyOutcome.DENY,
      priority: InvoicePolicyPriority.HIGH,
      errors: [`Invoice in status '${status}' cannot be voided.`],
      metadata: {
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "InvoiceVoidPolicy",
      },
    });
  }
}