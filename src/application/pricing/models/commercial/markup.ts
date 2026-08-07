import { createMoney, Money } from "../money";

export interface Markup {
  readonly code: string;
  readonly label: string;
  readonly amount: Money;
}

export function createMarkup(markup: Markup): Markup {
  return Object.freeze({
    code: markup.code,
    label: markup.label,
    amount: createMoney(markup.amount),
  });
}
