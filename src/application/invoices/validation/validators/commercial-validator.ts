import {
  createInvoiceValidationError,
  createInvoiceValidationResult,
  InvoiceValidationErrorCode,
  InvoiceValidationResult,
  InvoiceValidationStage,
} from "../models";
import { InvoiceValidationRequest } from "./invoice-request-validator";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export class CommercialValidator {
  public validate(request: InvoiceValidationRequest): InvoiceValidationResult {
    const errors = [];

    const invoiceQuote = request.invoice?.quoteReference;
    const requestQuote = request.quoteReference;
    const quoteReference = requestQuote ?? invoiceQuote;

    const invoicePricing = request.invoice?.pricingSnapshot;
    const requestPricing = request.pricingSnapshot;
    const pricingSnapshot = requestPricing ?? invoicePricing;

    const obligation = request.financialObligation ?? request.invoice?.financialObligation;

    if (!quoteReference || isBlank(quoteReference.quoteId) || isBlank(quoteReference.quoteVersion)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.COMMERCIAL,
          code: InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE,
          message: "Invoice quote reference is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!pricingSnapshot) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.COMMERCIAL,
          code: InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT,
          message: "Invoice pricing snapshot is required.",
          severity: "CRITICAL",
        }),
      );

      return createInvoiceValidationResult({
        stage: InvoiceValidationStage.COMMERCIAL,
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "CommercialValidator",
        },
      });
    }

    if (isBlank(pricingSnapshot.snapshotId) || isBlank(pricingSnapshot.pricingId) || isBlank(pricingSnapshot.version)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.COMMERCIAL,
          code: InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT,
          message: "Invoice pricing snapshot reference is invalid.",
          severity: "CRITICAL",
        }),
      );
    }

    if (isBlank(pricingSnapshot.currency)) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.COMMERCIAL,
          code: InvoiceValidationErrorCode.INVALID_CURRENCY,
          message: "Invoice pricing currency is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!isFiniteNumber(pricingSnapshot.totalAmount) || pricingSnapshot.totalAmount < 0) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.COMMERCIAL,
          code: InvoiceValidationErrorCode.INVALID_TOTAL_AMOUNT,
          message: "Invoice pricing total amount is invalid.",
          severity: "CRITICAL",
        }),
      );
    }

    if (invoiceQuote && requestQuote) {
      if (invoiceQuote.quoteId !== requestQuote.quoteId || invoiceQuote.quoteVersion !== requestQuote.quoteVersion) {
        errors.push(
          createInvoiceValidationError({
            stage: InvoiceValidationStage.COMMERCIAL,
            code: InvoiceValidationErrorCode.QUOTE_REFERENCE_INCONSISTENT,
            message: "Invoice quote reference is inconsistent with the supplied validation context.",
            severity: "CRITICAL",
          }),
        );
      }
    }

    if (invoicePricing && requestPricing) {
      if (
        invoicePricing.snapshotId !== requestPricing.snapshotId
        || invoicePricing.pricingId !== requestPricing.pricingId
        || invoicePricing.version !== requestPricing.version
      ) {
        errors.push(
          createInvoiceValidationError({
            stage: InvoiceValidationStage.COMMERCIAL,
            code: InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT,
            message: "Invoice pricing snapshot is inconsistent with the supplied validation context.",
            severity: "CRITICAL",
          }),
        );
      }
    }

    if (obligation && !isBlank(pricingSnapshot.currency) && !isBlank(obligation.currency) && pricingSnapshot.currency !== obligation.currency) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.COMMERCIAL,
          code: InvoiceValidationErrorCode.PRICING_CURRENCY_MISMATCH,
          message: "Invoice pricing currency must match financial obligation currency.",
          severity: "CRITICAL",
        }),
      );
    }

    if (obligation && isFiniteNumber(pricingSnapshot.totalAmount) && isFiniteNumber(obligation.totalAmount)) {
      if (pricingSnapshot.totalAmount !== obligation.totalAmount) {
        errors.push(
          createInvoiceValidationError({
            stage: InvoiceValidationStage.COMMERCIAL,
            code: InvoiceValidationErrorCode.PRICING_TOTAL_MISMATCH,
            message: "Invoice pricing total does not match the financial obligation total.",
            severity: "CRITICAL",
          }),
        );
      }
    }

    return createInvoiceValidationResult({
      stage: InvoiceValidationStage.COMMERCIAL,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "CommercialValidator",
      },
    });
  }
}