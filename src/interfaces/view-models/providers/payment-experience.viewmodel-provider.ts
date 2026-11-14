import { PaymentInitiationResult, PaymentStatus } from "../../../application/payments";
import { PaymentExperienceStatus, PaymentExperienceViewModel } from "../journeys/payment-experience.viewmodel";

export interface PaymentAttemptPresentation {
  readonly status: PaymentStatus;
  readonly reservationPaymentStatus: string;
  readonly balanceOutstanding: number;
}

function mapStatus(result: PaymentInitiationResult): PaymentExperienceStatus {
  switch (result.status) {
    case "INITIATED": return "INITIATED";
    case "PENDING": return "PENDING";
    case "FAILED": return "FAILED";
    case "UNAVAILABLE": return "UNAVAILABLE";
    case "COMPLETED": return "COMPLETED";
    case "CANCELLED": return "CANCELLED";
    case "UNKNOWN": return "UNKNOWN";
    default: return "UNKNOWN";
  }
}

function mapPaymentAttemptStatus(status: PaymentStatus): PaymentExperienceStatus {
  switch (status) {
    case PaymentStatus.COMPLETED: return "COMPLETED";
    case PaymentStatus.CANCELLED: return "CANCELLED";
    case PaymentStatus.AUTHORIZATION_FAILED: return "FAILED";
    default: return "PENDING";
  }
}

function messageFor(status: PaymentExperienceStatus): string {
  switch (status) {
    case "INITIATED": return "Payment has been initiated with the secure payment provider.";
    case "PENDING": return "Payment is pending confirmation from the payment provider.";
    case "FAILED": return "Payment could not be initiated. Please try again.";
    case "UNAVAILABLE": return "Payment is not available until a confirmed reservation payment context exists.";
    case "COMPLETED": return "Payment has been completed according to the current application state.";
    case "CANCELLED": return "Payment was cancelled. You can return to the payment stage to review it.";
    default: return "Payment status is not yet available.";
  }
}

export class PaymentExperienceViewModelProvider {
  public provide(
    result: PaymentInitiationResult,
    journeyId = result.reservationId,
    simulatedSupplierFulfilment = false,
    paymentAttempt?: PaymentAttemptPresentation,
  ): PaymentExperienceViewModel {
    const status = paymentAttempt ? mapPaymentAttemptStatus(paymentAttempt.status) : mapStatus(result);
    const reservationConfirmed = paymentAttempt
      ? paymentAttempt.reservationPaymentStatus === "COMPLETED"
      : status === "COMPLETED";
    return Object.freeze({
      journeyId,
      amount: result.amount,
      currency: result.currency,
      status,
      message: paymentAttempt?.status === PaymentStatus.CANCELLED
        ? "This payment attempt was cancelled. The reservation payment balance remains unchanged until verified payment processing."
        : messageFor(status),
      paymentAttemptStatus: paymentAttempt?.status,
      reservationPaymentStatus: paymentAttempt?.reservationPaymentStatus,
      balanceOutstanding: paymentAttempt?.balanceOutstanding,
      supplierFulfilmentNotice: simulatedSupplierFulfilment
        ? "Test only: accommodation supplier fulfilment was simulated. No Hotelbeds booking was created."
        : undefined,
      providerAction: result.status === "INITIATED" || result.status === "PENDING"
        ? Object.freeze({ label: "Proceed to secure payment", href: "#secure-payment", style: "primary" })
        : undefined,
      hostedPaymentAction: result.hostedPaymentAction
        ? Object.freeze({
            method: result.hostedPaymentAction.method,
            action: result.hostedPaymentAction.action,
            fields: Object.freeze({ ...result.hostedPaymentAction.fields }),
          })
        : undefined,
      recoveryAction: Object.freeze({ label: "Return to reservation review", href: `/ui/journeys/${journeyId}/review`, style: "neutral" }),
      confirmationAction: reservationConfirmed
        ? Object.freeze({ label: "View booking confirmation", href: `/ui/journeys/${journeyId}/confirmation`, style: "primary" })
        : undefined,
    });
  }
}