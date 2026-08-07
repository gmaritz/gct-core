import {
  AuthorizationRecord,
  CaptureRecord,
  createPaymentMetadata,
  createPaymentState,
  createPaymentTimeline,
  createTransactionReference,
  PaymentMetadata,
  PaymentMethod,
  PaymentPricingSnapshot,
  PaymentQuoteSnapshot,
  PaymentReference,
  PaymentReservationSnapshot,
  PaymentStatus,
  PaymentTimeline,
  PaymentInstrument,
  RefundRecord,
  SettlementRecord,
  TransactionReference,
} from "../models";

export interface PaymentComposition {
  readonly reference: PaymentReference;
  readonly transactionReference?: TransactionReference;
  readonly reservationSnapshot: PaymentReservationSnapshot;
  readonly quoteSnapshot?: PaymentQuoteSnapshot;
  readonly pricingSnapshot: PaymentPricingSnapshot;
  readonly paymentAmount: number;
  readonly currency: string;
  readonly paymentMethod: PaymentMethod;
  readonly paymentInstrument?: PaymentInstrument;
  readonly status: PaymentStatus;
  readonly authorization?: AuthorizationRecord;
  readonly capture?: CaptureRecord;
  readonly settlement?: SettlementRecord;
  readonly refunds?: ReadonlyArray<RefundRecord>;
  readonly timeline?: PaymentTimeline;
  readonly metadata: PaymentMetadata;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function ensureInvariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateRequiredComposition(composition: PaymentComposition): void {
  ensureInvariant(!isBlank(composition.reference?.paymentId), "Payment identity is required.");
  ensureInvariant(
    typeof composition.reservationSnapshot === "object" && composition.reservationSnapshot !== null,
    "Reservation snapshot is required.",
  );
  ensureInvariant(
    typeof composition.pricingSnapshot === "object" && composition.pricingSnapshot !== null,
    "Pricing snapshot is required.",
  );
  ensureInvariant(typeof composition.paymentMethod === "string", "Payment method is required.");
  ensureInvariant(!isBlank(composition.currency), "Payment currency is required.");
  ensureInvariant(typeof composition.status === "string", "Payment status is required.");
  ensureInvariant(typeof composition.metadata === "object" && composition.metadata !== null, "Payment metadata is required.");
}

export class Payment {
  public readonly reference: PaymentReference;
  public readonly transactionReference?: TransactionReference;
  public readonly reservationSnapshot: PaymentReservationSnapshot;
  public readonly quoteSnapshot?: PaymentQuoteSnapshot;
  public readonly pricingSnapshot: PaymentPricingSnapshot;
  public readonly paymentAmount: number;
  public readonly currency: string;
  public readonly paymentMethod: PaymentMethod;
  public readonly paymentInstrument?: PaymentInstrument;
  public readonly status: PaymentStatus;
  public readonly authorization?: AuthorizationRecord;
  public readonly capture?: CaptureRecord;
  public readonly settlement?: SettlementRecord;
  public readonly refunds: ReadonlyArray<RefundRecord>;
  public readonly timeline: PaymentTimeline;
  public readonly metadata: PaymentMetadata;

  private constructor(composition: PaymentComposition) {
    validateRequiredComposition(composition);

    const state = createPaymentState({
      reference: composition.reference,
      reservationSnapshot: composition.reservationSnapshot,
      quoteSnapshot: composition.quoteSnapshot,
      pricingSnapshot: composition.pricingSnapshot,
      paymentAmount: composition.paymentAmount,
      currency: composition.currency,
      paymentMethod: composition.paymentMethod,
      paymentInstrument: composition.paymentInstrument,
      status: composition.status,
      authorization: composition.authorization,
      capture: composition.capture,
      settlement: composition.settlement,
      refunds: composition.refunds ?? [],
    });

    this.reference = state.reference;
    this.transactionReference =
      typeof composition.transactionReference === "undefined"
        ? undefined
        : createTransactionReference(composition.transactionReference);
    this.reservationSnapshot = state.reservationSnapshot;
    this.quoteSnapshot = state.quoteSnapshot;
    this.pricingSnapshot = state.pricingSnapshot;
    this.paymentAmount = state.paymentAmount;
    this.currency = state.currency;
    this.paymentMethod = state.paymentMethod;
    this.paymentInstrument = state.paymentInstrument;
    this.status = state.status;
    this.authorization = state.authorization;
    this.capture = state.capture;
    this.settlement = state.settlement;
    this.refunds = state.refunds;
    this.timeline = createPaymentTimeline(composition.timeline ?? []);
    this.metadata = createPaymentMetadata(composition.metadata);

    Object.freeze(this);
  }

  public static create(composition: PaymentComposition): Payment {
    return new Payment(composition);
  }

  public static restore(composition: PaymentComposition): Payment {
    return new Payment(composition);
  }
}
