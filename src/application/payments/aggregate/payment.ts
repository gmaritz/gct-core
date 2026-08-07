export enum PaymentStatus {
  CREATED = "CREATED",
  PENDING_AUTHORIZATION = "PENDING_AUTHORIZATION",
  AUTHORIZED = "AUTHORIZED",
  AUTHORIZATION_FAILED = "AUTHORIZATION_FAILED",
  CAPTURED = "CAPTURED",
  SETTLED = "SETTLED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  REFUNDED = "REFUNDED",
}

export interface PaymentIdentity {
  readonly id: string;
}

export interface PaymentReservationSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly reservationId: string;
  readonly reservationReference: string;
}

export interface PaymentQuoteSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly quoteId: string;
  readonly quotationNumber: string;
  readonly expiresAt: Date;
}

export interface PaymentPricingSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly pricingId: string;
  readonly subtotal: number;
  readonly taxes: number;
  readonly discounts: number;
  readonly fees: number;
  readonly total: number;
  readonly currency: string;
}

export interface PaymentAuthorizationSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly authorizationId: string;
  readonly authorizedAt: Date;
  readonly amount: number;
  readonly currency: string;
  readonly providerReference: string;
  readonly status: string;
}

export interface PaymentCaptureSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly captureId: string;
  readonly amount: number;
  readonly currency: string;
  readonly providerReference: string;
  readonly status: string;
}

export interface PaymentSettlementSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly settlementId: string;
  readonly settledAt: Date;
  readonly amount: number;
  readonly currency: string;
  readonly providerReference: string;
  readonly status: string;
}

export interface PaymentRefundSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly refundId: string;
  readonly requestedAt: Date;
  readonly refundedAt?: Date;
  readonly amount: number;
  readonly currency: string;
  readonly reason: string;
  readonly status: string;
}

export interface PaymentTimelineEntry {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly milestone: string;
  readonly occurredAt: Date;
  readonly note?: string;
}

export interface PaymentMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface PaymentComposition {
  readonly identity: PaymentIdentity;
  readonly reservationSnapshot: PaymentReservationSnapshot;
  readonly quoteSnapshot?: PaymentQuoteSnapshot;
  readonly pricingSnapshot: PaymentPricingSnapshot;
  readonly paymentAmount: number;
  readonly currency: string;
  readonly paymentMethod: string;
  readonly status: PaymentStatus;
  readonly authorizationSnapshot?: PaymentAuthorizationSnapshot;
  readonly captureSnapshot?: PaymentCaptureSnapshot;
  readonly settlementSnapshot?: PaymentSettlementSnapshot;
  readonly refunds?: ReadonlyArray<PaymentRefundSnapshot>;
  readonly timeline?: ReadonlyArray<PaymentTimelineEntry>;
  readonly metadata: PaymentMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeIdentity(identity: PaymentIdentity): PaymentIdentity {
  return Object.freeze({
    id: identity.id,
  });
}

function freezeReservationSnapshot(snapshot: PaymentReservationSnapshot): PaymentReservationSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    reservationId: snapshot.reservationId,
    reservationReference: snapshot.reservationReference,
  });
}

function freezeQuoteSnapshot(snapshot: PaymentQuoteSnapshot): PaymentQuoteSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    quoteId: snapshot.quoteId,
    quotationNumber: snapshot.quotationNumber,
    expiresAt: cloneDate(snapshot.expiresAt),
  });
}

function freezePricingSnapshot(snapshot: PaymentPricingSnapshot): PaymentPricingSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    pricingId: snapshot.pricingId,
    subtotal: snapshot.subtotal,
    taxes: snapshot.taxes,
    discounts: snapshot.discounts,
    fees: snapshot.fees,
    total: snapshot.total,
    currency: snapshot.currency,
  });
}

function freezeAuthorizationSnapshot(snapshot: PaymentAuthorizationSnapshot): PaymentAuthorizationSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    authorizationId: snapshot.authorizationId,
    authorizedAt: cloneDate(snapshot.authorizedAt),
    amount: snapshot.amount,
    currency: snapshot.currency,
    providerReference: snapshot.providerReference,
    status: snapshot.status,
  });
}

function freezeCaptureSnapshot(snapshot: PaymentCaptureSnapshot): PaymentCaptureSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    captureId: snapshot.captureId,
    amount: snapshot.amount,
    currency: snapshot.currency,
    providerReference: snapshot.providerReference,
    status: snapshot.status,
  });
}

function freezeSettlementSnapshot(snapshot: PaymentSettlementSnapshot): PaymentSettlementSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    settlementId: snapshot.settlementId,
    settledAt: cloneDate(snapshot.settledAt),
    amount: snapshot.amount,
    currency: snapshot.currency,
    providerReference: snapshot.providerReference,
    status: snapshot.status,
  });
}

function freezeRefundSnapshot(snapshot: PaymentRefundSnapshot): PaymentRefundSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    refundId: snapshot.refundId,
    requestedAt: cloneDate(snapshot.requestedAt),
    refundedAt: typeof snapshot.refundedAt === "undefined" ? undefined : cloneDate(snapshot.refundedAt),
    amount: snapshot.amount,
    currency: snapshot.currency,
    reason: snapshot.reason,
    status: snapshot.status,
  });
}

function freezeTimelineEntry(entry: PaymentTimelineEntry): PaymentTimelineEntry {
  return Object.freeze({
    snapshotId: entry.snapshotId,
    capturedAt: cloneDate(entry.capturedAt),
    version: entry.version,
    milestone: entry.milestone,
    occurredAt: cloneDate(entry.occurredAt),
    note: entry.note,
  });
}

function freezeMetadata(metadata: PaymentMetadata): PaymentMetadata {
  return Object.freeze({
    createdAt: cloneDate(metadata.createdAt),
    updatedAt: cloneDate(metadata.updatedAt),
    version: metadata.version,
    source: metadata.source,
  });
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
  ensureInvariant(!isBlank(composition.identity?.id), "Payment identity is required.");
  ensureInvariant(
    typeof composition.reservationSnapshot === "object" && composition.reservationSnapshot !== null,
    "Reservation snapshot is required.",
  );
  ensureInvariant(
    typeof composition.pricingSnapshot === "object" && composition.pricingSnapshot !== null,
    "Pricing snapshot is required.",
  );
  ensureInvariant(!isBlank(composition.paymentMethod), "Payment method is required.");
  ensureInvariant(!isBlank(composition.currency), "Payment currency is required.");
  ensureInvariant(typeof composition.status === "string", "Payment status is required.");
  ensureInvariant(typeof composition.metadata === "object" && composition.metadata !== null, "Payment metadata is required.");
}

export class Payment {
  public readonly identity: PaymentIdentity;
  public readonly reservationSnapshot: PaymentReservationSnapshot;
  public readonly quoteSnapshot?: PaymentQuoteSnapshot;
  public readonly pricingSnapshot: PaymentPricingSnapshot;
  public readonly paymentAmount: number;
  public readonly currency: string;
  public readonly paymentMethod: string;
  public readonly status: PaymentStatus;
  public readonly authorizationSnapshot?: PaymentAuthorizationSnapshot;
  public readonly captureSnapshot?: PaymentCaptureSnapshot;
  public readonly settlementSnapshot?: PaymentSettlementSnapshot;
  public readonly refunds: ReadonlyArray<PaymentRefundSnapshot>;
  public readonly timeline: ReadonlyArray<PaymentTimelineEntry>;
  public readonly metadata: PaymentMetadata;

  private constructor(composition: PaymentComposition) {
    validateRequiredComposition(composition);

    this.identity = freezeIdentity(composition.identity);
    this.reservationSnapshot = freezeReservationSnapshot(composition.reservationSnapshot);
    this.quoteSnapshot =
      typeof composition.quoteSnapshot === "undefined"
        ? undefined
        : freezeQuoteSnapshot(composition.quoteSnapshot);
    this.pricingSnapshot = freezePricingSnapshot(composition.pricingSnapshot);
    this.paymentAmount = composition.paymentAmount;
    this.currency = composition.currency;
    this.paymentMethod = composition.paymentMethod;
    this.status = composition.status;
    this.authorizationSnapshot =
      typeof composition.authorizationSnapshot === "undefined"
        ? undefined
        : freezeAuthorizationSnapshot(composition.authorizationSnapshot);
    this.captureSnapshot =
      typeof composition.captureSnapshot === "undefined"
        ? undefined
        : freezeCaptureSnapshot(composition.captureSnapshot);
    this.settlementSnapshot =
      typeof composition.settlementSnapshot === "undefined"
        ? undefined
        : freezeSettlementSnapshot(composition.settlementSnapshot);
    this.refunds = Object.freeze((composition.refunds ?? []).map(freezeRefundSnapshot));
    this.timeline = Object.freeze((composition.timeline ?? []).map(freezeTimelineEntry));
    this.metadata = freezeMetadata(composition.metadata);

    Object.freeze(this);
  }

  public static create(composition: PaymentComposition): Payment {
    return new Payment(composition);
  }

  public static restore(composition: PaymentComposition): Payment {
    return new Payment(composition);
  }
}
