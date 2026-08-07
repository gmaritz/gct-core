import { createPaymentEvent, PaymentEvent } from "./payment-event";

export type PaymentTimeline = ReadonlyArray<PaymentEvent>;

export function createPaymentTimeline(timeline: ReadonlyArray<PaymentEvent>): PaymentTimeline {
  return Object.freeze((timeline ?? []).map(createPaymentEvent));
}
