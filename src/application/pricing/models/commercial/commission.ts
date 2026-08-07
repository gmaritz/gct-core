import { createMoney, Money } from "../money";

export interface Commission {
  readonly code: string;
  readonly label: string;
  readonly amount: Money;
}

export function createCommission(commission: Commission): Commission {
  return Object.freeze({
    code: commission.code,
    label: commission.label,
    amount: createMoney(commission.amount),
  });
}
