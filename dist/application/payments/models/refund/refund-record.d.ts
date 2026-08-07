import { PaymentProviderReference } from "../method";
import { RefundStatus } from "./refund-status";
export interface RefundRecord {
    readonly refundId: string;
    readonly requestedAt: Date;
    readonly refundedAt?: Date;
    readonly amount: number;
    readonly currency: string;
    readonly reason: string;
    readonly status: RefundStatus;
    readonly providerReference: PaymentProviderReference;
}
export declare function createRefundRecord(record: RefundRecord): RefundRecord;
//# sourceMappingURL=refund-record.d.ts.map