import { InvoiceStatus } from "../../models";
import {
  createInvoiceValidationError,
  createInvoiceValidationResult,
  InvoiceValidationErrorCode,
  InvoiceValidationResult,
  InvoiceValidationStage,
} from "../models";
import { InvoiceValidationRequest } from "./invoice-request-validator";

const invoiceStatuses = new Set<string>(Object.values(InvoiceStatus));

export class LifecycleReadinessValidator {
  public validate(request: InvoiceValidationRequest): InvoiceValidationResult {
    const errors = [];
    const status = request.invoice?.status;

    if (request.requiresExistingInvoice && !status) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.LIFECYCLE_READINESS,
          code: InvoiceValidationErrorCode.INVOICE_NOT_READY,
          message: "Invoice is not ready for lifecycle validation.",
          severity: "CRITICAL",
        }),
      );

      return createInvoiceValidationResult({
        stage: InvoiceValidationStage.LIFECYCLE_READINESS,
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "LifecycleReadinessValidator",
        },
      });
    }

    if (status && !invoiceStatuses.has(status)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.LIFECYCLE_READINESS,
          code: InvoiceValidationErrorCode.INVALID_INVOICE_STATUS,
          message: "Invoice status is invalid.",
          severity: "CRITICAL",
        }),
      );
    }

    if (request.requiresMutableState && status === InvoiceStatus.VOID) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.LIFECYCLE_READINESS,
          code: InvoiceValidationErrorCode.INVOICE_ALREADY_VOID,
          message: "Invoice is already void.",
          severity: "CRITICAL",
        }),
      );
    }

    if (request.requiresMutableState && status === InvoiceStatus.CANCELLED) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.LIFECYCLE_READINESS,
          code: InvoiceValidationErrorCode.INVOICE_ALREADY_CANCELLED,
          message: "Invoice is already cancelled.",
          severity: "CRITICAL",
        }),
      );
    }

    return createInvoiceValidationResult({
      stage: InvoiceValidationStage.LIFECYCLE_READINESS,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "LifecycleReadinessValidator",
      },
    });
  }
}