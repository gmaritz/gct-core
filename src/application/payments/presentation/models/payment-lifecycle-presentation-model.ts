export interface PaymentLifecycleTimelineEntry {
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly note?: string;
}

export interface PaymentLifecyclePresentationModel {
  readonly authorizationStatus: string;
  readonly captureStatus: string;
  readonly settlementStatus: string;
  readonly refundStatus: string;
  readonly lifecycleTimeline: ReadonlyArray<PaymentLifecycleTimelineEntry>;
}

export function createPaymentLifecyclePresentationModel(
  model: PaymentLifecyclePresentationModel,
): PaymentLifecyclePresentationModel {
  return Object.freeze({
    authorizationStatus: model.authorizationStatus,
    captureStatus: model.captureStatus,
    settlementStatus: model.settlementStatus,
    refundStatus: model.refundStatus,
    lifecycleTimeline: Object.freeze(
      (model.lifecycleTimeline ?? []).map((entry) =>
        Object.freeze({
          eventType: entry.eventType,
          occurredAt: new Date(entry.occurredAt.getTime()),
          note: entry.note,
        }),
      ),
    ),
  });
}
