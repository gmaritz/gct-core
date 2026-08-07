import { Currency, Money } from "../models";
import {
  createPricingValidationError,
  createPricingValidationResult,
  PricingValidationErrorCode,
  PricingValidationResult,
  PricingValidationStage,
} from "./models";
import { PricingValidationRequest } from "./pricing-request-validator";

function addMoney(
  left: Money,
  right: Money,
): Money {
  return {
    amount: left.amount + right.amount,
    currency: left.currency,
  };
}

function subtractMoney(
  left: Money,
  right: Money,
): Money {
  return {
    amount: left.amount - right.amount,
    currency: left.currency,
  };
}

function matchesCurrency(expected: Currency, values: ReadonlyArray<Money>): boolean {
  return values.every((value) => value.currency === expected);
}

export class PricingIntegrityValidator {
  public validate(request: PricingValidationRequest): PricingValidationResult {
    const errors = [];

    if (!request.taxes || request.taxes.entries.length === 0) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_TAXES,
          stage: PricingValidationStage.INTEGRITY,
          message: "Tax configuration is required.",
          critical: true,
        }),
      );
    }

    if (!request.fees || request.fees.length === 0) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_FEES,
          stage: PricingValidationStage.INTEGRITY,
          message: "Fee structure is required.",
          critical: false,
        }),
      );
    }

    if (request.currency && request.totals) {
      const totals = request.totals;
      const totalMoneyParts = [
        totals.subtotal,
        totals.taxTotal,
        totals.feeTotal,
        totals.discountTotal,
        totals.markupTotal,
        totals.commissionTotal,
        totals.grandTotal,
      ];

      const breakdownCurrencies = (request.breakdown?.lineItems ?? []).flatMap((lineItem) => [lineItem.unitAmount, lineItem.totalAmount]);
      const taxCurrencies = request.taxes?.entries.map((entry) => entry.amount) ?? [];
      const feeCurrencies = (request.fees ?? []).map((fee) => fee.amount);
      const discountCurrencies = (request.discounts ?? []).map((discount) => discount.amount);
      const markupCurrencies = (request.markups ?? []).map((markup) => markup.amount);
      const commissionCurrencies = (request.commissions ?? []).map((commission) => commission.amount);

      const consistent = matchesCurrency(request.currency, [
        ...totalMoneyParts,
        ...breakdownCurrencies,
        ...taxCurrencies,
        ...feeCurrencies,
        ...discountCurrencies,
        ...markupCurrencies,
        ...commissionCurrencies,
      ]);

      if (!consistent) {
        errors.push(
          createPricingValidationError({
            code: PricingValidationErrorCode.CURRENCY_INCONSISTENCY,
            stage: PricingValidationStage.INTEGRITY,
            message: "Currency must be consistent across pricing components.",
            critical: true,
          }),
        );
      }

      const expectedGrandTotal = subtractMoney(
        addMoney(
          addMoney(addMoney(totals.subtotal, totals.taxTotal), totals.feeTotal),
          totals.markupTotal,
        ),
        addMoney(totals.discountTotal, totals.commissionTotal),
      );

      if (expectedGrandTotal.amount !== totals.grandTotal.amount) {
        errors.push(
          createPricingValidationError({
            code: PricingValidationErrorCode.TOTALS_MISMATCH,
            stage: PricingValidationStage.INTEGRITY,
            message: "Pricing totals are inconsistent.",
            critical: true,
          }),
        );
      }
    }

    return createPricingValidationResult({
      stage: PricingValidationStage.INTEGRITY,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "PricingIntegrityValidator",
      },
    });
  }
}
