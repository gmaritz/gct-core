import {
  Invoice,
  InvoiceCustomerReference,
  InvoiceFinancialObligation,
  InvoicePricingSnapshot,
  InvoiceQuoteReference,
  InvoiceReservationReference,
} from "../../";
import {
  createInvoiceValidationError,
  createInvoiceValidationResult,
  InvoiceValidationErrorCode,
  InvoiceValidationResult,
  InvoiceValidationStage,
} from "../models";

export interface InvoiceReservationContext {
  readonly exists?: boolean;
  readonly status?: string;
  readonly reservationId?: string;
}

export interface InvoiceValidationRequest {
  readonly invoice?: Invoice | null;
  readonly reservationReference?: InvoiceReservationReference | null;
  readonly customerReference?: InvoiceCustomerReference | null;
  readonly quoteReference?: InvoiceQuoteReference | null;
  readonly pricingSnapshot?: InvoicePricingSnapshot | null;
  readonly financialObligation?: InvoiceFinancialObligation | null;
  readonly reservationContext?: InvoiceReservationContext | null;
  readonly requiresExistingInvoice?: boolean;
  readonly requiresMutableState?: boolean;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function resolveReservationReference(request: InvoiceValidationRequest): InvoiceReservationReference | null {
  return request.reservationReference ?? request.invoice?.reservationReference ?? null;
}

function resolveCustomerReference(request: InvoiceValidationRequest): InvoiceCustomerReference | null {
  return request.customerReference ?? request.invoice?.customerReference ?? null;
}

function resolveQuoteReference(request: InvoiceValidationRequest): InvoiceQuoteReference | null {
  return request.quoteReference ?? request.invoice?.quoteReference ?? null;
}

function resolvePricingSnapshot(request: InvoiceValidationRequest): InvoicePricingSnapshot | null {
  return request.pricingSnapshot ?? request.invoice?.pricingSnapshot ?? null;
}

function resolveFinancialObligation(request: InvoiceValidationRequest): InvoiceFinancialObligation | null {
  return request.financialObligation ?? request.invoice?.financialObligation ?? null;
}

export class InvoiceRequestValidator {
  public validate(request: InvoiceValidationRequest | null | undefined): InvoiceValidationResult {
    const errors = [];

    if (!request) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_REQUEST,
          message: "Invoice request is required.",
          severity: "CRITICAL",
        }),
      );

      return createInvoiceValidationResult({
        stage: InvoiceValidationStage.REQUEST,
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "InvoiceRequestValidator",
        },
      });
    }

    if (request.requiresExistingInvoice && isBlank(request.invoice?.identity?.id)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_INVOICE_IDENTIFIER,
          message: "Invoice identifier is required.",
          severity: "CRITICAL",
        }),
      );
    }

    const reservationReference = resolveReservationReference(request);
    if (isBlank(reservationReference?.reservationId)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE,
          message: "Invoice reservation reference is required.",
          severity: "CRITICAL",
        }),
      );
    }

    const customerReference = resolveCustomerReference(request);
    const customerId = customerReference?.customerId;
    const travellerId = customerReference?.travellerId;
    if (isBlank(customerId) && isBlank(travellerId)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_CUSTOMER_REFERENCE,
          message: "Invoice customer or traveller reference is required.",
          severity: "CRITICAL",
        }),
      );
    }

    const quoteReference = resolveQuoteReference(request);
    if (isBlank(quoteReference?.quoteId) || isBlank(quoteReference?.quoteVersion)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE,
          message: "Invoice quote reference is required.",
          severity: "CRITICAL",
        }),
      );
    }

    const pricingSnapshot = resolvePricingSnapshot(request);
    if (!pricingSnapshot) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT,
          message: "Invoice pricing snapshot is required.",
          severity: "CRITICAL",
        }),
      );
    }

    const financialObligation = resolveFinancialObligation(request);
    if (!financialObligation) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_FINANCIAL_OBLIGATION,
          message: "Invoice financial obligation is required.",
          severity: "CRITICAL",
        }),
      );
    }

    return createInvoiceValidationResult({
      stage: InvoiceValidationStage.REQUEST,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "InvoiceRequestValidator",
      },
    });
  }
}