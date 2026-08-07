import {
  createPaymentLifecyclePresentationModel,
  PaymentLifecyclePresentationModel,
} from "./payment-lifecycle-presentation-model";
import {
  createPaymentStatusPresentationModel,
  PaymentStatusPresentationModel,
} from "./payment-status-presentation-model";
import {
  createPaymentSummaryPresentationModel,
  PaymentSummaryPresentationModel,
} from "./payment-summary-presentation-model";

export interface PaymentViewModel {
  readonly summary: PaymentSummaryPresentationModel;
  readonly lifecycle: PaymentLifecyclePresentationModel;
  readonly status: PaymentStatusPresentationModel;
  readonly cta: {
    readonly label: string;
    readonly href: string;
    readonly style: "primary" | "secondary" | "neutral";
  };
  readonly badgeStyles: {
    readonly statusBadge: "success" | "warning" | "neutral";
    readonly paymentMethodBadge: "info" | "neutral";
  };
  readonly displayLabels: {
    readonly totalLabel: string;
    readonly statusLabel: string;
    readonly lifecycleLabel: string;
  };
  readonly metadata: {
    readonly generatedAt: Date;
    readonly version: string;
    readonly requestId: string;
  };
}

export function createPaymentViewModel(viewModel: PaymentViewModel): PaymentViewModel {
  return Object.freeze({
    summary: createPaymentSummaryPresentationModel(viewModel.summary),
    lifecycle: createPaymentLifecyclePresentationModel(viewModel.lifecycle),
    status: createPaymentStatusPresentationModel(viewModel.status),
    cta: Object.freeze({
      label: viewModel.cta.label,
      href: viewModel.cta.href,
      style: viewModel.cta.style,
    }),
    badgeStyles: Object.freeze({
      statusBadge: viewModel.badgeStyles.statusBadge,
      paymentMethodBadge: viewModel.badgeStyles.paymentMethodBadge,
    }),
    displayLabels: Object.freeze({
      totalLabel: viewModel.displayLabels.totalLabel,
      statusLabel: viewModel.displayLabels.statusLabel,
      lifecycleLabel: viewModel.displayLabels.lifecycleLabel,
    }),
    metadata: Object.freeze({
      generatedAt: new Date(viewModel.metadata.generatedAt.getTime()),
      version: viewModel.metadata.version,
      requestId: viewModel.metadata.requestId,
    }),
  });
}
