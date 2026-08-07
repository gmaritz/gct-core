export interface PricingIdentity {
  readonly id: string;
}

export interface PricingSummary {
  readonly productId: string;
  readonly productType: string;
  readonly description: string;
}

export interface PricingBreakdownLineItem {
  readonly code: string;
  readonly label: string;
  readonly amount: number;
  readonly quantity: number;
}

export interface PricingBreakdown {
  readonly lineItems: ReadonlyArray<PricingBreakdownLineItem>;
}

export interface PricingTaxEntry {
  readonly code: string;
  readonly amount: number;
}

export interface PricingFeeEntry {
  readonly code: string;
  readonly amount: number;
}

export interface PricingDiscountEntry {
  readonly code: string;
  readonly amount: number;
}

export interface PricingMarkupEntry {
  readonly code: string;
  readonly amount: number;
}

export interface PricingCommissionEntry {
  readonly code: string;
  readonly amount: number;
}

export interface PricingTaxSummary {
  readonly entries: ReadonlyArray<PricingTaxEntry>;
}

export interface PricingFeeSummary {
  readonly entries: ReadonlyArray<PricingFeeEntry>;
}

export interface PricingDiscountSummary {
  readonly entries: ReadonlyArray<PricingDiscountEntry>;
}

export interface PricingMarkupSummary {
  readonly entries: ReadonlyArray<PricingMarkupEntry>;
}

export interface PricingCommissionSummary {
  readonly entries: ReadonlyArray<PricingCommissionEntry>;
}

export interface PricingTotals {
  readonly subtotal: number;
  readonly taxTotal: number;
  readonly feeTotal: number;
  readonly discountTotal: number;
  readonly markupTotal: number;
  readonly commissionTotal: number;
  readonly grandTotal: number;
}

export interface PricingMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface PricingComposition {
  readonly identity: PricingIdentity;
  readonly summary: PricingSummary;
  readonly breakdown: PricingBreakdown;
  readonly taxes: PricingTaxSummary;
  readonly fees: PricingFeeSummary;
  readonly discounts: PricingDiscountSummary;
  readonly markups: PricingMarkupSummary;
  readonly commissions: PricingCommissionSummary;
  readonly totals: PricingTotals;
  readonly currency: string;
  readonly metadata: PricingMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeIdentity(identity: PricingIdentity): PricingIdentity {
  return Object.freeze({
    id: identity.id,
  });
}

function freezeSummary(summary: PricingSummary): PricingSummary {
  return Object.freeze({
    productId: summary.productId,
    productType: summary.productType,
    description: summary.description,
  });
}

function freezeBreakdownLineItem(item: PricingBreakdownLineItem): PricingBreakdownLineItem {
  return Object.freeze({
    code: item.code,
    label: item.label,
    amount: item.amount,
    quantity: item.quantity,
  });
}

function freezeBreakdown(breakdown: PricingBreakdown): PricingBreakdown {
  return Object.freeze({
    lineItems: Object.freeze(breakdown.lineItems.map(freezeBreakdownLineItem)),
  });
}

function freezeTaxEntry(entry: PricingTaxEntry): PricingTaxEntry {
  return Object.freeze({
    code: entry.code,
    amount: entry.amount,
  });
}

function freezeFeeEntry(entry: PricingFeeEntry): PricingFeeEntry {
  return Object.freeze({
    code: entry.code,
    amount: entry.amount,
  });
}

function freezeDiscountEntry(entry: PricingDiscountEntry): PricingDiscountEntry {
  return Object.freeze({
    code: entry.code,
    amount: entry.amount,
  });
}

function freezeMarkupEntry(entry: PricingMarkupEntry): PricingMarkupEntry {
  return Object.freeze({
    code: entry.code,
    amount: entry.amount,
  });
}

function freezeCommissionEntry(entry: PricingCommissionEntry): PricingCommissionEntry {
  return Object.freeze({
    code: entry.code,
    amount: entry.amount,
  });
}

function freezeTaxes(taxes: PricingTaxSummary): PricingTaxSummary {
  return Object.freeze({
    entries: Object.freeze(taxes.entries.map(freezeTaxEntry)),
  });
}

function freezeFees(fees: PricingFeeSummary): PricingFeeSummary {
  return Object.freeze({
    entries: Object.freeze(fees.entries.map(freezeFeeEntry)),
  });
}

function freezeDiscounts(discounts: PricingDiscountSummary): PricingDiscountSummary {
  return Object.freeze({
    entries: Object.freeze(discounts.entries.map(freezeDiscountEntry)),
  });
}

function freezeMarkups(markups: PricingMarkupSummary): PricingMarkupSummary {
  return Object.freeze({
    entries: Object.freeze(markups.entries.map(freezeMarkupEntry)),
  });
}

function freezeCommissions(commissions: PricingCommissionSummary): PricingCommissionSummary {
  return Object.freeze({
    entries: Object.freeze(commissions.entries.map(freezeCommissionEntry)),
  });
}

function freezeTotals(totals: PricingTotals): PricingTotals {
  return Object.freeze({
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    feeTotal: totals.feeTotal,
    discountTotal: totals.discountTotal,
    markupTotal: totals.markupTotal,
    commissionTotal: totals.commissionTotal,
    grandTotal: totals.grandTotal,
  });
}

function freezeMetadata(metadata: PricingMetadata): PricingMetadata {
  return Object.freeze({
    createdAt: cloneDate(metadata.createdAt),
    updatedAt: cloneDate(metadata.updatedAt),
    version: metadata.version,
    source: metadata.source,
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
  public readonly taxes: PricingTaxSummary;
  public readonly fees: PricingFeeSummary;
  public readonly discounts: PricingDiscountSummary;
  public readonly markups: PricingMarkupSummary;
  public readonly commissions: PricingCommissionSummary;
  public readonly totals: PricingTotals;
  public readonly currency: string;
  public readonly metadata: PricingMetadata;

  private constructor(composition: PricingComposition) {
    validateRequiredComposition(composition);

    this.identity = freezeIdentity(composition.identity);
    this.summary = freezeSummary(composition.summary);
    this.breakdown = freezeBreakdown(composition.breakdown);
    this.taxes = freezeTaxes(composition.taxes);
    this.fees = freezeFees(composition.fees);
    this.discounts = freezeDiscounts(composition.discounts);
    this.markups = freezeMarkups(composition.markups);
    this.commissions = freezeCommissions(composition.commissions);
    this.totals = freezeTotals(composition.totals);
    this.currency = composition.currency;
    this.metadata = freezeMetadata(composition.metadata);

    Object.freeze(this);
  }

  public static create(composition: PricingComposition): Pricing {
    return new Pricing(composition);
  }

  public static restore(composition: PricingComposition): Pricing {
    return new Pricing(composition);
  }
}
