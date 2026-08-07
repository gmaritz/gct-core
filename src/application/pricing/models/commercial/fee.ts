import { createMoney, Money } from "../money";

export interface Fee {
  readonly code: string;
  readonly label: string;
  readonly amount: Money;
}

export function createFee(fee: Fee): Fee {
  return Object.freeze({
    code: fee.code,
    label: fee.label,
    amount: createMoney(fee.amount),
  });
}
