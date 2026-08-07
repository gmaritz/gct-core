import { PaymentProviderReference } from "../method";
import { AuthorizationStatus } from "./authorization-status";
export interface AuthorizationRecord {
    readonly authorizationId: string;
    readonly authorizedAt: Date;
    readonly amount: number;
    readonly currency: string;
    readonly providerReference: PaymentProviderReference;
    readonly status: AuthorizationStatus;
}
export declare function createAuthorizationRecord(record: AuthorizationRecord): AuthorizationRecord;
//# sourceMappingURL=authorization-record.d.ts.map