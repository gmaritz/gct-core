import { randomUUID } from "crypto";
import { DefaultPaymentAggregateFactory, PaymentEngine, PaymentEngineRequest } from "./engine";
import { PaymentGatewayProviderReference, PaymentProviderIntegrationService, PaymentGatewayResult } from "./integration";
import { PaymentGateway } from "./integration/payment-gateway";
import { PaymentMethod, PaymentStatus } from "./models";
import {
  GatewayReadinessValidator,
  PaymentRequestValidator,
  PaymentValidationPipeline,
  PricingValidator,
  ReservationValidator,
  SettlementReadinessValidator,
} from "./validation";
import { PaymentPolicyPipeline } from "./policies";
import { PaymentProcessingPipeline } from "./processing";
import { ReservationRepository } from "../reservations/repository";
import { ReservationStatus } from "../reservations/aggregate";
import {
  PaymentAttemptEnvironment,
  PaymentAttemptRepository,
} from "./payment-attempt";

export type PaymentInitiationStatus = "INITIATED" | "PENDING" | "FAILED" | "INVALID" | "UNAVAILABLE" | "COMPLETED" | "CANCELLED" | "UNKNOWN";

export interface PaymentInitiationRequest {
  readonly reservationId: string;
  readonly engineRequest: PaymentEngineRequest;
  readonly providerReference: PaymentGatewayProviderReference;
  readonly simulatedSupplierFulfilment?: boolean;
}

export interface PaymentInitiationResult {
  readonly status: PaymentInitiationStatus;
  readonly reservationId: string;
  readonly paymentId?: string;
  readonly paymentAttemptId?: string;
  readonly paymentReference?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly paymentStatus?: PaymentStatus;
  readonly hostedPaymentAction?: import("./integration").HostedPaymentAction;
  readonly gatewayResult?: PaymentGatewayResult;
  readonly errors: ReadonlyArray<string>;
}

export interface PaymentInitiationService {
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
}

export interface PaymentContextResolver {
  resolveForJourney(journeyId: string): Promise<PaymentInitiationRequest | null>;
}

export class UnavailablePaymentContextResolver implements PaymentContextResolver {
  public async resolveForJourney(_journeyId: string): Promise<PaymentInitiationRequest | null> {
    return null;
  }
}

function failure(request: PaymentInitiationRequest, status: PaymentInitiationStatus, errors: ReadonlyArray<string>): PaymentInitiationResult {
  return Object.freeze({ status, reservationId: request.reservationId, errors: Object.freeze([...errors]) });
}

export class DefaultPaymentInitiationService implements PaymentInitiationService {
  private readonly integration: PaymentProviderIntegrationService;

  public constructor(
    private readonly engine: PaymentEngine,
    gateway: PaymentGateway,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly providerEnvironment: PaymentAttemptEnvironment,
  ) {
    this.integration = new PaymentProviderIntegrationService(gateway);
  }

  public async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    if (!request.reservationId.trim() || request.engineRequest.paymentRequest.reservationSnapshot?.reservationId !== request.reservationId) {
      return failure(request, "INVALID", ["A valid reservation context is required."]);
    }

    const existingStatus = request.engineRequest.paymentRequest.status;
    if (existingStatus === PaymentStatus.COMPLETED) {
      return failure(request, "COMPLETED", ["Payment has already been completed."]);
    }
    if (existingStatus === PaymentStatus.CANCELLED) {
      return failure(request, "CANCELLED", ["Payment was cancelled and must be reviewed before retrying."]);
    }
    if (existingStatus && existingStatus !== PaymentStatus.CREATED) {
      return failure(request, "PENDING", ["A payment transaction is already in progress."]);
    }

    const engineResult = await this.engine.execute(request.engineRequest);
    if (!engineResult.success || !engineResult.payment) {
      return failure(request, "INVALID", [
        ...engineResult.validationResult.errors.map((error) => error.message),
        ...(engineResult.policyEvaluation?.permitted === false ? ["Payment policy does not permit initiation."] : []),
      ]);
    }

    const payment = engineResult.payment;
    if (!Number.isFinite(payment.paymentAmount) || payment.paymentAmount <= 0 || payment.currency !== "ZAR") {
      return failure(request, "INVALID", ["PayFast requires a positive authoritative ZAR payment amount."]);
    }

    let paymentAttemptId: string;
    let paymentReference: string;
    const requestedReference = `gct-${randomUUID()}`;
    try {
      const attempt = await this.paymentAttemptRepository.createOrFind({
        idempotencyKey: request.engineRequest.requestId?.trim() || payment.reference.paymentId,
        paymentId: payment.reference.paymentId,
        reservationId: request.reservationId,
        paymentReference: requestedReference,
        provider: "PAYFAST",
        environment: this.providerEnvironment,
        amount: payment.paymentAmount,
        currency: payment.currency,
        status: PaymentStatus.CREATED,
      });
      paymentAttemptId = attempt.attemptId;
      paymentReference = attempt.paymentReference;
      const claimed = await this.paymentAttemptRepository.claimInitiation(paymentReference);
      if (!claimed) {
        return Object.freeze({
          status: attempt.status === PaymentStatus.AUTHORIZATION_FAILED ? "FAILED" : "PENDING",
          reservationId: request.reservationId,
          paymentId: payment.reference.paymentId,
          paymentAttemptId,
          paymentReference,
          amount: payment.paymentAmount,
          currency: payment.currency,
          paymentStatus: attempt.status,
          errors: Object.freeze(["A payment attempt already exists for this initiation request."]),
        });
      }
    } catch {
      return failure(request, "FAILED", ["Payment attempt could not be persisted."]);
    }

    let gatewayResult: PaymentGatewayResult;
    try {
      gatewayResult = await this.integration.authorize({
        engineResult,
        providerReference: { ...request.providerReference, reference: paymentReference },
      });
    } catch {
      await this.paymentAttemptRepository.updateStatus(
        paymentReference,
        PaymentStatus.AUTHORIZATION_FAILED,
        undefined,
        new Date(),
      ).catch(() => undefined);
      return failure(request, "FAILED", ["Payment provider request could not be constructed."]);
    }

    if (gatewayResult.transactionReference?.transactionId) {
      try {
        await this.paymentAttemptRepository.associateProviderTransaction(
          paymentReference,
          gatewayResult.transactionReference.transactionId,
        );
      } catch {
        return failure(request, "FAILED", ["Payment provider transaction could not be correlated safely."]);
      }
    }

    if (!gatewayResult.success) {
      await this.paymentAttemptRepository.updateStatus(
        paymentReference,
        PaymentStatus.AUTHORIZATION_FAILED,
        undefined,
        gatewayResult.metadata.completedAt,
      ).catch(() => undefined);
      return Object.freeze({
        status: "FAILED",
        reservationId: request.reservationId,
        paymentId: payment.reference.paymentId,
        paymentAttemptId,
        paymentReference,
        amount: payment.paymentAmount,
        currency: payment.currency,
        paymentStatus: gatewayResult.paymentStatus ?? undefined,
        gatewayResult,
        errors: Object.freeze(["Payment initiation was not completed."]),
      });
    }

    try {
      await this.paymentAttemptRepository.updateStatus(
        paymentReference,
        PaymentStatus.AUTHORIZATION_REQUESTED,
        undefined,
        gatewayResult.metadata.completedAt,
      );
    } catch {
      return failure(request, "FAILED", ["Payment attempt response could not be persisted."]);
    }

    const pending = gatewayResult.paymentStatus === PaymentStatus.CREATED || engineResult.metadata.pending;
    return Object.freeze({
      status: pending ? "PENDING" : "INITIATED",
      reservationId: request.reservationId,
      paymentId: payment.reference.paymentId,
      paymentAttemptId,
      paymentReference,
      amount: payment.paymentAmount,
      currency: payment.currency,
      paymentStatus: gatewayResult.paymentStatus ?? engineResult.payment.status,
      hostedPaymentAction: gatewayResult.hostedPaymentAction,
      gatewayResult,
      errors: Object.freeze([]),
    });
  }
}

export class CanonicalReservationPaymentContextResolver implements PaymentContextResolver {
  public constructor(private readonly reservationRepository: ReservationRepository) {}

  public async resolveForJourney(journeyId: string): Promise<PaymentInitiationRequest | null> {
    if (!/^journey-[a-z0-9-]+$/i.test(journeyId)) {
      return null;
    }

    const reservations = await this.reservationRepository.findByJourneyId(journeyId);
    const reservation = reservations.find((candidate) => candidate.status !== ReservationStatus.CANCELLED);
    const pricing = reservation?.pricingSnapshot;
    if (!reservation || !pricing || pricing.totalPrice <= 0 || !pricing.currency) {
      return null;
    }

    const paymentSnapshot = reservation.paymentSnapshot;
    const paymentStatus = paymentSnapshot?.paymentStatus as PaymentStatus | undefined;
    const paymentMethod = paymentSnapshot?.paymentMethod as PaymentMethod | undefined;
    const effectiveStatus = paymentStatus ?? PaymentStatus.CREATED;
    const effectiveMethod = paymentMethod ?? PaymentMethod.CARD;
    const paymentId = `payment-${reservation.identity.id}`;

    return {
      reservationId: reservation.identity.id,
      simulatedSupplierFulfilment: reservation.supplierReferences.some((reference) => reference.isSimulated === true),
      providerReference: {
        providerIdentifier: "payfast",
        reference: paymentId,
        correlationId: `reservation-${reservation.identity.id}`,
      },
      engineRequest: {
        requestId: `payment-${reservation.identity.id}`,
        source: "IMP-009",
        paymentRequest: {
          reference: {
            paymentId,
            reservationId: reservation.identity.id,
            quotationNumber: reservation.reservationNumber,
          },
          reservationSnapshot: {
            snapshotId: `reservation-${reservation.identity.id}`,
            capturedAt: reservation.metadata.updatedAt,
            version: reservation.metadata.version,
            reservationId: reservation.identity.id,
            reservationReference: reservation.reservationNumber,
          },
          pricingSnapshot: {
            snapshotId: reservation.pricingSnapshot.snapshotId,
            capturedAt: reservation.pricingSnapshot.capturedAt,
            version: reservation.pricingSnapshot.version,
            pricingId: `pricing-${reservation.identity.id}`,
            subtotal: reservation.pricingSnapshot.totalPrice,
            taxes: reservation.pricingSnapshot.taxes,
            discounts: reservation.pricingSnapshot.discounts,
            fees: reservation.pricingSnapshot.fees,
            total: reservation.pricingSnapshot.totalPrice,
            currency: pricing.currency,
          },
          paymentAmount: pricing.totalPrice,
          currency: pricing.currency,
          paymentMethod: effectiveMethod,
          status: effectiveStatus,
          metadata: {
            createdAt: reservation.metadata.createdAt,
            updatedAt: reservation.metadata.updatedAt,
            version: reservation.metadata.version,
            source: "IMP-009",
          },
          reservationContext: {
            exists: true,
            status: reservation.status,
            payable: !paymentSnapshot || paymentSnapshot.balanceOutstanding > 0,
          },
          gatewayContext: {
            providerReference: {
              providerIdentifier: "payfast",
              reference: paymentId,
              correlationId: `reservation-${reservation.identity.id}`,
            },
            correlationId: `reservation-${reservation.identity.id}`,
            requestId: `payment-${reservation.identity.id}`,
            paymentContextId: `payment-context-${reservation.identity.id}`,
          },
        },
      },
    };
  }
}

export function createDefaultPaymentEngine(): PaymentEngine {
  return new PaymentEngine(
    new PaymentValidationPipeline(
      new PaymentRequestValidator(),
      new ReservationValidator(),
      new PricingValidator(),
      new SettlementReadinessValidator(),
      new GatewayReadinessValidator(),
    ),
    new PaymentPolicyPipeline(),
    new PaymentProcessingPipeline(),
    new DefaultPaymentAggregateFactory(),
  );
}