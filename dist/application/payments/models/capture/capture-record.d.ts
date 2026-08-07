import { PaymentProviderReference } from "../method";
import { CaptureStatus } from "./capture-status";
export interface CaptureRecord {
    readonly captureId: string;
    readonly capturedAt: Date;
    readonly amount: number;
    readonly currency: string;
    readonly providerReference: PaymentProviderReference;
    readonly status: CaptureStatus;
}
export declare function createCaptureRecord(record: CaptureRecord): CaptureRecord;
//# sourceMappingURL=capture-record.d.ts.map