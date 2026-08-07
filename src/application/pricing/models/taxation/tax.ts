import { createMoney, Money } from "../money";
import { TaxType } from "./tax-type";

export interface Tax {
  readonly code: string;
  readonly type: TaxType;
  readonly amount: Money;
  readonly description?: string;
}

export function createTax(tax: Tax): Tax {
  return Object.freeze({
    code: tax.code,
    type: tax.type,
    amount: createMoney(tax.amount),
    description: tax.description,
  });
}
