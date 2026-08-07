import { Currency } from "./currency";

export interface Money {
  readonly amount: number;
  readonly currency: Currency;
}

export function createMoney(value: Money): Money {
  return Object.freeze({
    amount: value.amount,
    currency: value.currency,
  });
}

export function equalsMoney(left: Money, right: Money): boolean {
  return left.amount === right.amount && left.currency === right.currency;
}
