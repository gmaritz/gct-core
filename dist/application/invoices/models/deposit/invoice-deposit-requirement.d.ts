export type InvoiceDepositRequirementType = "FIXED" | "PERCENTAGE";
export interface InvoiceDepositRequirement {
    readonly type: InvoiceDepositRequirementType;
    readonly value: number;
}
export declare function createInvoiceDepositRequirement(requirement: InvoiceDepositRequirement): InvoiceDepositRequirement;
//# sourceMappingURL=invoice-deposit-requirement.d.ts.map