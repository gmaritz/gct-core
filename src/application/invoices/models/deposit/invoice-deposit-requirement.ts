export type InvoiceDepositRequirementType = "FIXED" | "PERCENTAGE";

export interface InvoiceDepositRequirement {
  readonly type: InvoiceDepositRequirementType;
  readonly value: number;
}

export function createInvoiceDepositRequirement(
  requirement: InvoiceDepositRequirement,
): InvoiceDepositRequirement {
  return Object.freeze({
    type: requirement.type,
    value: requirement.value,
  });
}