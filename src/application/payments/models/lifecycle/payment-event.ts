import { createTransactionReference, TransactionReference } from "../identity";
import { PaymentEventType } from "./payment-event-type";

export interface PaymentEvent {
  readonly eventType: PaymentEventType;
  readonly occurredAt: Date;
  readonly note?: string;
  readonly transactionReference?: TransactionReference;
}

export function createPaymentEvent(event: PaymentEvent): PaymentEvent {
  return Object.freeze({
    eventType: event.eventType,
    occurredAt: new Date(event.occurredAt.getTime()),
    note: event.note,
    transactionReference: event.transactionReference
      ? createTransactionReference(event.transactionReference)
      : undefined,
  });
}
