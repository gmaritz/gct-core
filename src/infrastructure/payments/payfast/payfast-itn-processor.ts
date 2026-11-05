import {
  PaymentAttemptNotificationConflictError,
  PaymentAttemptNotFoundError,
  PaymentAttemptRepository,
  transitionReservationFromVerifiedPayFastNotification,
} from "@application/payments";
import { PaymentStatus } from "@application/payments";
import { Reservation } from "@application/reservations/aggregate";
import { ReservationRepository } from "@application/reservations/repository";
import {
  PayFastItnField,
  PayFastItnRequestError,
  PayFastItnServerValidator,
  hashPayFastItnBody,
  isPayFastItnSourceAddress,
  parsePayFastItnFields,
  verifyPayFastItnSignature,
} from "./payfast-itn-security";
import type { PayFastIntegrationConfig } from "./index";

export interface PayFastItnProcessResult {
  readonly status: "APPLIED" | "DUPLICATE";
  readonly paymentReference: string;
}

function fieldsByName(fields: ReadonlyArray<PayFastItnField>): ReadonlyMap<string, string> {
  return new Map(fields.map(({ name, value }) => [name, value]));
}

function requiredField(fields: ReadonlyMap<string, string>, name: string): string {
  const value = fields.get(name)?.trim();
  if (!value) throw new PayFastItnRequestError(400, "Payment notification is incomplete.");
  return value;
}

function toMinorUnits(value: string | number): bigint {
  const normalized = String(value).trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new PayFastItnRequestError(400, "Payment notification amount is invalid.");
  return BigInt(match[1]!) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
}

export class PayFastItnProcessor {
  public constructor(
    private readonly config: PayFastIntegrationConfig,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly serverValidator: PayFastItnServerValidator,
  ) {}

  public async process(rawBody: Buffer, peerAddress: string): Promise<PayFastItnProcessResult> {
    const fields = parsePayFastItnFields(rawBody);
    if (!isPayFastItnSourceAddress(peerAddress)) {
      throw new PayFastItnRequestError(403, "Payment notification source is not permitted.");
    }
    if (!verifyPayFastItnSignature(fields, this.config.passphrase)) {
      throw new PayFastItnRequestError(403, "Payment notification signature is invalid.");
    }
    let serverValidated: boolean;
    try {
      serverValidated = await this.serverValidator.validate(rawBody, this.config.environment);
    } catch {
      throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
    }
    if (!serverValidated) {
      throw new PayFastItnRequestError(403, "Payment notification validation failed.");
    }

    const values = fieldsByName(fields);
    const paymentReference = requiredField(values, "m_payment_id");
    const providerTransactionId = requiredField(values, "pf_payment_id");
    const merchantId = requiredField(values, "merchant_id");
    const rawStatus = requiredField(values, "payment_status").toUpperCase();
    const grossAmount = requiredField(values, "amount_gross");
    if (paymentReference.length > 100 || !/^\d+$/.test(providerTransactionId) || !/^\d{8}$/.test(merchantId)) {
      throw new PayFastItnRequestError(400, "Payment notification identifiers are invalid.");
    }
    if (merchantId !== this.config.merchantId) {
      throw new PayFastItnRequestError(403, "Payment notification merchant does not match configuration.");
    }
    if (rawStatus !== "COMPLETE" && rawStatus !== "CANCELLED") {
      throw new PayFastItnRequestError(400, "Payment notification status is unsupported.");
    }

    const attempt = await this.paymentAttemptRepository.findByPaymentReference(paymentReference);
    if (!attempt) throw new PaymentAttemptNotFoundError();
    if (attempt.provider !== "PAYFAST" || attempt.environment !== this.config.environment || attempt.currency !== "ZAR") {
      throw new PaymentAttemptNotificationConflictError("Payment attempt provider, environment, or currency does not match.");
    }
    const notificationAmountMinor = toMinorUnits(grossAmount);
    const attemptAmountMinor = toMinorUnits(attempt.amount);
    if (notificationAmountMinor !== attemptAmountMinor) {
      throw new PaymentAttemptNotificationConflictError("Payment notification amount does not match the persisted attempt.");
    }

    const paymentStatus = rawStatus === "COMPLETE" ? PaymentStatus.COMPLETED : PaymentStatus.CANCELLED;
    const notificationHash = hashPayFastItnBody(rawBody);
    if (attempt.status === paymentStatus) {
      if (
        attempt.providerTransactionId === providerTransactionId
        && attempt.providerNotificationHash === notificationHash
      ) return Object.freeze({ status: "DUPLICATE", paymentReference });
      throw new PaymentAttemptNotificationConflictError("A conflicting notification already exists for this attempt.");
    }
    if (attempt.status !== PaymentStatus.AUTHORIZATION_REQUESTED || attempt.providerTransactionId) {
      throw new PaymentAttemptNotificationConflictError("Payment attempt is not awaiting a PayFast notification.");
    }

    const reservation = await this.reservationRepository.findById(attempt.reservationId);
    if (!reservation || reservation.identity.id !== attempt.reservationId || !reservation.pricingSnapshot) {
      throw new PaymentAttemptNotificationConflictError("Canonical Reservation context is unavailable.");
    }
    if (attempt.paymentId !== `payment-${reservation.identity.id}`) {
      throw new PaymentAttemptNotificationConflictError("Payment attempt does not match the canonical Payment identity for this Reservation.");
    }
    const expectedPaymentSnapshot = reservation.paymentSnapshot;
    if (!expectedPaymentSnapshot) throw new PaymentAttemptNotificationConflictError("Reservation payment snapshot is unavailable.");
    let transitionedReservation: Reservation;
    try {
      transitionedReservation = transitionReservationFromVerifiedPayFastNotification(
        reservation,
        attempt,
        rawStatus,
        grossAmount,
      );
    } catch {
      throw new PaymentAttemptNotificationConflictError("Verified notification cannot be applied to the canonical Reservation state.");
    }
    const transitionedPaymentSnapshot = transitionedReservation.paymentSnapshot;
    if (!transitionedPaymentSnapshot) throw new PaymentAttemptNotificationConflictError("Payment transition could not be constructed.");

    const result = await this.paymentAttemptRepository.applyVerifiedPayFastNotification({
      paymentReference,
      reservationId: reservation.identity.id,
      providerTransactionId,
      notificationHash,
      providerStatus: rawStatus,
      paymentStatus,
      expectedPaymentSnapshot,
      nextPaymentSnapshot: transitionedPaymentSnapshot,
      nextReservationMetadata: transitionedReservation.metadata,
    });
    return Object.freeze({ status: result, paymentReference });
  }
}
