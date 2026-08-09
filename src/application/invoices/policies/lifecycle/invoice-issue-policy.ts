import { InvoiceStatus } from "../../models";
import { InvoicePolicy } from "../contracts";
import {
  createInvoicePolicyResult,
  InvoiceOperation,
  InvoicePolicyContext,
  InvoicePolicyOutcome,
  InvoicePolicyPriority,
  InvoicePolicyResult,
} from "../models";

export class InvoiceIssuePolicy implements InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> {
  public evaluate(context: InvoicePolicyContext): InvoicePolicyResult {
    if (context.operation !== InvoiceOperation.ISSUE) {
      return createInvoicePolicyResult({
        policyName: "InvoiceIssuePolicy",
        outcome: InvoicePolicyOutcome.IGNORE,
        priority: InvoicePolicyPriority.LOW,
        observations: ["Issue policy does not apply to the requested operation."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceIssuePolicy",
        },
      });
    }

    if (!context.invoice) {
      return createInvoicePolicyResult({
        policyName: "InvoiceIssuePolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice is required to evaluate an issue request."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceIssuePolicy",
        },
      });
    }

    if (!context.validationResult.success) {
      return createInvoicePolicyResult({
        policyName: "InvoiceIssuePolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.HIGH,
        errors: ["Invoice validation must succeed before issuing an invoice."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceIssuePolicy",
        },
      });
    }

    const status = context.invoice.status;
    if (status === InvoiceStatus.DRAFT) {
      return createInvoicePolicyResult({
        policyName: "InvoiceIssuePolicy",
        outcome: InvoicePolicyOutcome.ALLOW,
        priority: InvoicePolicyPriority.NORMAL,
        observations: ["Draft invoice is eligible to be issued."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceIssuePolicy",
        },
      });
    }

    return createInvoicePolicyResult({
      policyName: "InvoiceIssuePolicy",
      outcome: InvoicePolicyOutcome.DENY,
      priority: InvoicePolicyPriority.HIGH,
      errors: [`Invoice in status '${status}' cannot be issued.`],
      metadata: {
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "InvoiceIssuePolicy",
      },
    });
  }
}