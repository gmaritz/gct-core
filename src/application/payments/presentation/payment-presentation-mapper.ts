import { PaymentEngineResult } from "../engine";
import {
  createPaymentLifecyclePresentationModel,
  createPaymentStatusPresentationModel,
  createPaymentSummaryPresentationModel,
  PaymentLifecyclePresentationModel,
  PaymentStatusPresentationModel,
  PaymentSummaryPresentationModel,
} from "./models";

export interface PaymentPresentationOutput {
  readonly summary: PaymentSummaryPresentationModel;
  readonly lifecycle: PaymentLifecyclePresentationModel;
  readonly status: PaymentStatusPresentationModel;
}

function resolveRefundStatus(refunds: ReadonlyArray<{ readonly status: string }>): string {
  if (refunds.length === 0) {
    return "NOT_STARTED";
  }

  return refunds[refunds.length - 1].status;
}

function resolveStatusBadge(status: string): PaymentStatusPresentationModel["statusBadge"] {
  if (status === "COMPLETED" || status === "SETTLED" || status === "CAPTURED") {
    return "success";
  }

  if (status.includes("FAILED") || status === "CANCELLED") {
    return "warning";
  }

  return "neutral";
}

function resolveNextAction(result: PaymentEngineResult): string {
  if (result.metadata.pending) {
    return "Complete required payment action";
  }

  if (!result.success) {
    return "Retry payment";
  }

  return "No action required";
}

function resolveHeadline(result: PaymentEngineResult): string {
  if (result.metadata.pending) {
    return "Payment action required";
  }

  return result.success ? "Payment ready" : "Payment unsuccessful";
}

function informationalMessage(result: PaymentEngineResult): string {
  const stage = result.metadata.stages[result.metadata.stages.length - 1] ?? "RESULT";
  return `Payment mapped at ${stage.toLowerCase()} stage`;
}

export class PaymentPresentationMapper {
  public map(result: PaymentEngineResult): PaymentPresentationOutput | null {
    if (!result.success || !result.payment) {
      return null;
    }

    const payment = result.payment;

    const summary = createPaymentSummaryPresentationModel({
      paymentReference: payment.reference.paymentId,
      reservationReference: payment.reservationSnapshot.reservationReference,
      traveller: payment.paymentInstrument?.holderName ?? "Traveller pending",
      totalAmount: payment.paymentAmount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.status,
    });

    const lifecycle = createPaymentLifecyclePresentationModel({
      authorizationStatus: payment.authorization?.status ?? "NOT_STARTED",
      captureStatus: payment.capture?.status ?? "NOT_STARTED",
      settlementStatus: payment.settlement?.status ?? "NOT_STARTED",
      refundStatus: resolveRefundStatus(payment.refunds),
      lifecycleTimeline: payment.timeline.map((event) => ({
        eventType: event.eventType,
        occurredAt: event.occurredAt,
        note: event.note,
      })),
    });

    const warnings = Object.freeze([
      ...result.validationResult.warnings,
      ...(result.policyEvaluation?.warnings ?? []),
      ...(result.processingResult?.warnings ?? []),
    ]);

    const status = createPaymentStatusPresentationModel({
      headline: resolveHeadline(result),
      statusBadge: resolveStatusBadge(payment.status),
      nextAction: resolveNextAction(result),
      warnings,
      informationalMessages: Object.freeze([informationalMessage(result)]),
    });

    return Object.freeze({
      summary,
      lifecycle,
      status,
    });
  }
}
