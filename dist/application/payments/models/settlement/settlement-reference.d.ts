import { PaymentProviderReference } from "../method";
export interface SettlementReference {
    readonly settlementId: string;
    readonly batchReference?: string;
    readonly providerReference: PaymentProviderReference;
}
export declare function createSettlementReference(reference: SettlementReference): SettlementReference;
//# sourceMappingURL=settlement-reference.d.ts.map