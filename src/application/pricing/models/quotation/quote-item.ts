import { createMoney, Money } from "../money";

export interface QuoteItem {
  readonly code: string;
  readonly label: string;
  readonly amount: Money;
  readonly quantity: number;
}

export function createQuoteItem(item: QuoteItem): QuoteItem {
  return Object.freeze({
    code: item.code,
    label: item.label,
    amount: createMoney(item.amount),
    quantity: item.quantity,
  });
}
