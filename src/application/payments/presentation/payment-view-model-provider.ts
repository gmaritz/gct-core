import { PaymentEngineResult } from "../engine";
import {
  createPaymentViewModel,
  PaymentLifecyclePresentationModel,
  PaymentStatusPresentationModel,
  PaymentSummaryPresentationModel,
  PaymentViewModel,
} from "./models";
import { PaymentPresentationMapper } from "./payment-presentation-mapper";

function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function resolvePaymentMethodBadge(paymentMethod: string): PaymentViewModel["badgeStyles"]["paymentMethodBadge"] {
  switch (paymentMethod) {
    case "CARD":
    case "WALLET":
      return "info";
    default:
      return "neutral";
  }
}

function resolveCta(status: PaymentStatusPresentationModel): PaymentViewModel["cta"] {
  if (status.nextAction.toLowerCase().startsWith("complete required")) {
    return {
      label: "Complete Action",
      href: "#payment-action",
      style: "secondary",
    };
  }

  if (status.nextAction.includes("Retry")) {
    return {
      label: "Retry Payment",
      href: "#payment-retry",
      style: "primary",
    };
  }

  return {
    label: "View Payment",
    href: "#payment-summary",
    style: "neutral",
  };
}

export class PaymentViewModelProvider {
  public constructor(private readonly mapper: PaymentPresentationMapper = new PaymentPresentationMapper()) {}

  public provideViewModel(
    summary: PaymentSummaryPresentationModel,
    lifecycle: PaymentLifecyclePresentationModel,
    status: PaymentStatusPresentationModel,
    requestId: string,
  ): PaymentViewModel {
    return createPaymentViewModel({
      summary,
      lifecycle,
      status,
      cta: resolveCta(status),
      badgeStyles: {
        statusBadge: status.statusBadge,
        paymentMethodBadge: resolvePaymentMethodBadge(summary.paymentMethod),
      },
      displayLabels: {
        totalLabel: formatMoney(summary.totalAmount, summary.currency),
        statusLabel: summary.paymentStatus,
        lifecycleLabel: `${lifecycle.authorizationStatus} / ${lifecycle.captureStatus} / ${lifecycle.settlementStatus}`,
      },
      metadata: {
        generatedAt: new Date(),
        version: "1.0.0",
        requestId,
      },
    });
  }

  public mapPaymentResultToViewModel(result: PaymentEngineResult): PaymentViewModel | null {
    const presentation = this.mapper.map(result);

    if (!presentation) {
      return null;
    }

    return this.provideViewModel(
      presentation.summary,
      presentation.lifecycle,
      presentation.status,
      result.metadata.requestId,
    );
  }
}
