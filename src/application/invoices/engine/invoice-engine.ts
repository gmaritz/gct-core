import { ApplicationService } from "@application/application-service";
import { InvoiceOperation, InvoicePolicyOutcome } from "../policies";
import {
  createInvoiceEngineError,
  createInvoiceEngineResult,
  InvoiceEngineErrorCode,
  InvoiceEngineOutcome,
  InvoiceEngineResult,
  createInvoiceOperationExecution,
  InvoiceOperationExecution,
} from "./models";
import { createInvoiceEngineContext, InvoiceEngineRequest } from "./models/invoice-engine-context";
import {
  createInvoiceExecutionContext,
  InvoiceExecutionContext,
  withExecutionResultingInvoice,
} from "./models/invoice-execution-context";
import {
  InvoiceCancellationOperation,
  InvoiceCreateOperation,
  InvoiceIssueOperation,
  InvoiceOperationHandler,
  InvoicePaymentOperation,
  InvoiceRefundOperation,
  InvoiceVoidOperation,
} from "./operations";

function defaultHandlers(): ReadonlyArray<InvoiceOperationHandler> {
  return Object.freeze([
    new InvoiceCreateOperation(),
    new InvoiceIssueOperation(),
    new InvoicePaymentOperation(),
    new InvoiceCancellationOperation(),
    new InvoiceVoidOperation(),
    new InvoiceRefundOperation(),
  ]);
}

function toPolicyErrors(outcome: InvoicePolicyOutcome): string {
  if (outcome === InvoicePolicyOutcome.REQUIRE_ACTION) {
    return "Invoice policy requires action before execution.";
  }

  return "Invoice policy denied operation execution.";
}

export class InvoiceEngine implements ApplicationService<InvoiceEngineRequest, InvoiceEngineResult> {
  private readonly operationHandlers: Map<InvoiceOperation, InvoiceOperationHandler>;

  public constructor(handlers: ReadonlyArray<InvoiceOperationHandler> = defaultHandlers()) {
    this.operationHandlers = new Map(handlers.map((handler) => [handler.operation, handler]));
  }

  public async execute(request: InvoiceEngineRequest): Promise<InvoiceEngineResult> {
    const engineContext = createInvoiceEngineContext(request);
    const executionContext = createInvoiceExecutionContext(engineContext);

    if (!executionContext.validationResult.success) {
      return createInvoiceEngineResult({
        success: false,
        operation: executionContext.operation,
        outcome: InvoiceEngineOutcome.REJECTED,
        invoice: executionContext.invoice ?? null,
        validationResult: executionContext.validationResult,
        policyEvaluation: executionContext.policyEvaluation,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.VALIDATION_FAILED,
            message: "Invoice validation failed; execution cannot proceed.",
          }),
        ],
        warnings: executionContext.validationResult.warnings,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: executionContext.metadata.requestId,
          source: executionContext.metadata.source,
          stages: [...executionContext.metadata.stages, "VALIDATION_GUARD"],
        },
      });
    }

    if (!executionContext.policyEvaluation.permitted) {
      const errorCode = executionContext.policyEvaluation.outcome === InvoicePolicyOutcome.REQUIRE_ACTION
        ? InvoiceEngineErrorCode.POLICY_ACTION_REQUIRED
        : InvoiceEngineErrorCode.POLICY_DENIED;

      return createInvoiceEngineResult({
        success: false,
        operation: executionContext.operation,
        outcome: executionContext.policyEvaluation.outcome === InvoicePolicyOutcome.REQUIRE_ACTION
          ? InvoiceEngineOutcome.PENDING_ACTION
          : InvoiceEngineOutcome.REJECTED,
        invoice: executionContext.invoice ?? null,
        validationResult: executionContext.validationResult,
        policyEvaluation: executionContext.policyEvaluation,
        errors: [
          createInvoiceEngineError({
            code: errorCode,
            message: toPolicyErrors(executionContext.policyEvaluation.outcome),
          }),
        ],
        warnings: executionContext.policyEvaluation.warnings,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: executionContext.metadata.requestId,
          source: executionContext.metadata.source,
          stages: [...executionContext.metadata.stages, "POLICY_GUARD"],
        },
      });
    }

    const handler = this.operationHandlers.get(executionContext.operation);
    if (!handler) {
      return createInvoiceEngineResult({
        success: false,
        operation: executionContext.operation,
        outcome: InvoiceEngineOutcome.REJECTED,
        invoice: executionContext.invoice ?? null,
        validationResult: executionContext.validationResult,
        policyEvaluation: executionContext.policyEvaluation,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION,
            message: `Unsupported invoice operation '${executionContext.operation}'.`,
          }),
        ],
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: executionContext.metadata.requestId,
          source: executionContext.metadata.source,
          stages: [...executionContext.metadata.stages, "DISPATCH"],
        },
      });
    }

    const operationResult = this.executeOperation(handler, executionContext);
    if (!operationResult.success || !operationResult.invoice) {
      return createInvoiceEngineResult({
        success: false,
        operation: executionContext.operation,
        outcome: InvoiceEngineOutcome.REJECTED,
        invoice: executionContext.invoice ?? null,
        validationResult: executionContext.validationResult,
        policyEvaluation: executionContext.policyEvaluation,
        errors: operationResult.errors,
        warnings: operationResult.warnings,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: executionContext.metadata.requestId,
          source: executionContext.metadata.source,
          stages: [...executionContext.metadata.stages, "OPERATION_FAILED"],
        },
      });
    }

    const completed = withExecutionResultingInvoice(executionContext, operationResult.invoice);

    return createInvoiceEngineResult({
      success: true,
      operation: executionContext.operation,
      outcome: InvoiceEngineOutcome.EXECUTED,
      invoice: completed.resultingInvoice,
      validationResult: completed.validationResult,
      policyEvaluation: completed.policyEvaluation,
      financialImpact: operationResult.financialImpact,
      errors: operationResult.errors,
      warnings: operationResult.warnings,
      metadata: {
        completedAt: new Date(),
        version: "1.0.0",
        requestId: completed.metadata.requestId,
        source: completed.metadata.source,
        stages: completed.metadata.stages,
      },
    });
  }

  private executeOperation(
    handler: InvoiceOperationHandler,
    context: InvoiceExecutionContext,
  ): InvoiceOperationExecution {
    try {
      return handler.execute(context);
    } catch (error) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.CALCULATION_ERROR,
            message: error instanceof Error ? error.message : "Invoice operation execution failed.",
          }),
        ],
      });
    }
  }
}
