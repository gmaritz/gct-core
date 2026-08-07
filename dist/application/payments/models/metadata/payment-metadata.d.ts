import { PaymentAudit } from "./payment-audit";
export interface PaymentMetadata {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: string;
    readonly source: string;
    readonly audit?: PaymentAudit;
}
export declare function createPaymentMetadata(metadata: PaymentMetadata): PaymentMetadata;
//# sourceMappingURL=payment-metadata.d.ts.map