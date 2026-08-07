import { ReservationStatus } from "../../aggregate";

export interface ReservationViewModelPayment {
  readonly status: string;
  readonly progress: string;
}

export interface ReservationViewModelNextAction {
  readonly label: string;
  readonly href: string;
  readonly style: string;
}

export interface ReservationViewModelMetadata {
  readonly generatedAt: Date;
  readonly version: string;
  readonly requestId: string;
}

export interface ReservationViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status: ReservationStatus;
  readonly statusBadgeStyle: string;
  readonly travellers: string;
  readonly accommodationSummary: string;
  readonly pricingSummary: string;
  readonly payment: ReservationViewModelPayment;
  readonly timelineHeadline: string;
  readonly outstandingActions: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly nextAction: ReservationViewModelNextAction;
  readonly metadata: ReservationViewModelMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezePayment(payment: ReservationViewModelPayment): ReservationViewModelPayment {
  return Object.freeze({
    status: payment.status,
    progress: payment.progress,
  });
}

function freezeNextAction(action: ReservationViewModelNextAction): ReservationViewModelNextAction {
  return Object.freeze({
    label: action.label,
    href: action.href,
    style: action.style,
  });
}

export function createReservationViewModel(model: ReservationViewModel): ReservationViewModel {
  return Object.freeze({
    id: model.id,
    title: model.title,
    subtitle: model.subtitle,
    status: model.status,
    statusBadgeStyle: model.statusBadgeStyle,
    travellers: model.travellers,
    accommodationSummary: model.accommodationSummary,
    pricingSummary: model.pricingSummary,
    payment: freezePayment(model.payment),
    timelineHeadline: model.timelineHeadline,
    outstandingActions: Object.freeze([...model.outstandingActions]),
    warnings: Object.freeze([...model.warnings]),
    nextAction: freezeNextAction(model.nextAction),
    metadata: Object.freeze({
      generatedAt: cloneDate(model.metadata.generatedAt),
      version: model.metadata.version,
      requestId: model.metadata.requestId,
    }),
  });
}
