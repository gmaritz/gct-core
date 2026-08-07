import { createMoney, Money } from "../money";
import { createTax, Tax } from "./tax";

export interface TaxBreakdown {
  readonly entries: ReadonlyArray<Tax>;
  readonly total: Money;
}

export function createTaxBreakdown(breakdown: TaxBreakdown): TaxBreakdown {
  return Object.freeze({
    entries: Object.freeze(breakdown.entries.map(createTax)),
    total: createMoney(breakdown.total),
  });
}
