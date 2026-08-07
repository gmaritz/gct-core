import { TransactionReference } from "../identity";
import { PaymentEventType } from "./payment-event-type";
export interface PaymentEvent {
    readonly eventType: PaymentEventType;
    readonly occurredAt: Date;
    readonly note?: string;
    readonly transactionReference?: TransactionReference;
}
export declare function createPaymentEvent(event: PaymentEvent): PaymentEvent;
//# sourceMappingURL=payment-event.d.ts.map