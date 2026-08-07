import { createPaymentProviderReference, PaymentProviderReference } from "../method";
import { AuthorizationStatus } from "./authorization-status";

export interface AuthorizationRecord {
  readonly authorizationId: string;
  readonly authorizedAt: Date;
  readonly amount: number;
  readonly currency: string;
  readonly providerReference: PaymentProviderReference;
  readonly status: AuthorizationStatus;
}

export function createAuthorizationRecord(record: AuthorizationRecord): AuthorizationRecord {
  return Object.freeze({
    authorizationId: record.authorizationId,
    authorizedAt: new Date(record.authorizedAt.getTime()),
    amount: record.amount,
    currency: record.currency,
    providerReference: createPaymentProviderReference(record.providerReference),
    status: record.status,
  });
}
