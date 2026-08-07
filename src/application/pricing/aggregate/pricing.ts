import {
  Commission,
  createCommission,
  createDiscount,
  createFee,
  createMarkup,
  createPricingBreakdown,
  createPricingMetadata,
  createPricingSummary,
  createPricingTotal,
  createTaxBreakdown,
  Currency,
  Discount,
  Fee,
  Markup,
  PricingBreakdown,
  PricingMetadata,
  PricingSummary,
  PricingTotal,
  TaxBreakdown,
} from "../models";

export interface PricingIdentity {
  readonly id: string;
}

export interface PricingComposition {
  readonly identity: PricingIdentity;
  readonly summary: PricingSummary;
  readonly breakdown: PricingBreakdown;
  readonly taxes: TaxBreakdown;
  readonly fees: ReadonlyArray<Fee>;
  readonly discounts: ReadonlyArray<Discount>;
  readonly markups: ReadonlyArray<Markup>;
  readonly commissions: ReadonlyArray<Commission>;
  readonly totals: PricingTotal;
  readonly currency: Currency;
  readonly metadata: PricingMetadata;
}

function freezeIdentity(identity: PricingIdentity): PricingIdentity {
  return Object.freeze({
    id: identity.id,
  });
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function ensureInvariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateRequiredComposition(composition: PricingComposition): void {
  ensureInvariant(!isBlank(composition.identity?.id), "Pricing identity is required.");
  ensureInvariant(!isBlank(composition.currency), "Pricing currency is required.");
  ensureInvariant(typeof composition.totals === "object" && composition.totals !== null, "Pricing totals are required.");
  ensureInvariant(typeof composition.breakdown === "object" && composition.breakdown !== null, "Pricing breakdown is required.");
  ensureInvariant(
    Array.isArray(composition.breakdown.lineItems) && composition.breakdown.lineItems.length > 0,
    "Pricing breakdown is required.",
  );
  ensureInvariant(
    typeof composition.metadata === "object" && composition.metadata !== null,
    "Pricing metadata is required.",
  );
}

export class Pricing {
  public readonly identity: PricingIdentity;
  public readonly summary: PricingSummary;
  public readonly breakdown: PricingBreakdown;
  public readonly taxes: TaxBreakdown;
  public readonly fees: ReadonlyArray<Fee>;
  public readonly discounts: ReadonlyArray<Discount>;
  public readonly markups: ReadonlyArray<Markup>;
  public readonly commissions: ReadonlyArray<Commission>;
  public readonly totals: PricingTotal;
  public readonly currency: Currency;
  public readonly metadata: PricingMetadata;

  private constructor(composition: PricingComposition) {
    validateRequiredComposition(composition);

    this.identity = freezeIdentity(composition.identity);
    this.summary = createPricingSummary(composition.summary);
    this.breakdown = createPricingBreakdown(composition.breakdown);
    this.taxes = createTaxBreakdown(composition.taxes);
    this.fees = Object.freeze(composition.fees.map(createFee));
    this.discounts = Object.freeze(composition.discounts.map(createDiscount));
    this.markups = Object.freeze(composition.markups.map(createMarkup));
    this.commissions = Object.freeze(composition.commissions.map(createCommission));
    this.totals = createPricingTotal(composition.totals);
    this.currency = composition.currency;
    this.metadata = createPricingMetadata(composition.metadata);

    Object.freeze(this);
  }

  public static create(composition: PricingComposition): Pricing {
    return new Pricing(composition);
  }

  public static restore(composition: PricingComposition): Pricing {
    return new Pricing(composition);
  }
}
