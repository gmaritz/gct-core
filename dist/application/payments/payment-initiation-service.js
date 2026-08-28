"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalReservationPaymentContextResolver = exports.DefaultPaymentInitiationService = exports.UnavailablePaymentContextResolver = void 0;
exports.createDefaultPaymentEngine = createDefaultPaymentEngine;
const engine_1 = require("./engine");
const integration_1 = require("./integration");
const models_1 = require("./models");
const validation_1 = require("./validation");
const policies_1 = require("./policies");
const processing_1 = require("./processing");
const aggregate_1 = require("../reservations/aggregate");
class UnavailablePaymentContextResolver {
    async resolveForJourney(_journeyId) {
        return null;
    }
}
exports.UnavailablePaymentContextResolver = UnavailablePaymentContextResolver;
function failure(request, status, errors) {
    return Object.freeze({ status, reservationId: request.reservationId, errors: Object.freeze([...errors]) });
}
class DefaultPaymentInitiationService {
    constructor(engine, gateway) {
        this.engine = engine;
        this.integration = new integration_1.PaymentProviderIntegrationService(gateway);
    }
    async initiatePayment(request) {
        if (!request.reservationId.trim() || request.engineRequest.paymentRequest.reservationSnapshot?.reservationId !== request.reservationId) {
            return failure(request, "INVALID", ["A valid reservation context is required."]);
        }
        const existingStatus = request.engineRequest.paymentRequest.status;
        if (existingStatus === models_1.PaymentStatus.COMPLETED) {
            return failure(request, "COMPLETED", ["Payment has already been completed."]);
        }
        if (existingStatus === models_1.PaymentStatus.CANCELLED) {
            return failure(request, "CANCELLED", ["Payment was cancelled and must be reviewed before retrying."]);
        }
        if (existingStatus && existingStatus !== models_1.PaymentStatus.CREATED) {
            return failure(request, "PENDING", ["A payment transaction is already in progress."]);
        }
        const engineResult = await this.engine.execute(request.engineRequest);
        if (!engineResult.success || !engineResult.payment) {
            return failure(request, "INVALID", [
                ...engineResult.validationResult.errors.map((error) => error.message),
                ...(engineResult.policyEvaluation?.permitted === false ? ["Payment policy does not permit initiation."] : []),
            ]);
        }
        const gatewayResult = await this.integration.authorize({
            engineResult,
            providerReference: request.providerReference,
        });
        if (!gatewayResult.success) {
            return Object.freeze({
                status: "FAILED",
                reservationId: request.reservationId,
                paymentId: engineResult.payment.reference.paymentId,
                amount: engineResult.payment.paymentAmount,
                currency: engineResult.payment.currency,
                paymentStatus: gatewayResult.paymentStatus ?? undefined,
                hostedPaymentAction: gatewayResult.hostedPaymentAction,
                gatewayResult,
                errors: Object.freeze(["Payment initiation was not completed."]),
            });
        }
        const pending = gatewayResult.paymentStatus === models_1.PaymentStatus.CREATED || engineResult.metadata.pending;
        return Object.freeze({
            status: pending ? "PENDING" : "INITIATED",
            reservationId: request.reservationId,
            paymentId: engineResult.payment.reference.paymentId,
            amount: engineResult.payment.paymentAmount,
            currency: engineResult.payment.currency,
            paymentStatus: gatewayResult.paymentStatus ?? engineResult.payment.status,
            hostedPaymentAction: gatewayResult.hostedPaymentAction,
            gatewayResult,
            errors: Object.freeze([]),
        });
    }
}
exports.DefaultPaymentInitiationService = DefaultPaymentInitiationService;
class CanonicalReservationPaymentContextResolver {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }
    async resolveForJourney(journeyId) {
        if (!/^journey-[a-z0-9-]+$/i.test(journeyId)) {
            return null;
        }
        const reservations = await this.reservationRepository.findByJourneyId(journeyId);
        const reservation = reservations.find((candidate) => candidate.status !== aggregate_1.ReservationStatus.CANCELLED);
        const pricing = reservation?.pricingSnapshot;
        if (!reservation || !pricing || pricing.totalPrice <= 0 || !pricing.currency) {
            return null;
        }
        const paymentSnapshot = reservation.paymentSnapshot;
        const paymentStatus = paymentSnapshot?.paymentStatus;
        const paymentMethod = paymentSnapshot?.paymentMethod;
        const effectiveStatus = paymentStatus ?? models_1.PaymentStatus.CREATED;
        const effectiveMethod = paymentMethod ?? models_1.PaymentMethod.CARD;
        const paymentId = `payment-${reservation.identity.id}`;
        return {
            reservationId: reservation.identity.id,
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
exports.CanonicalReservationPaymentContextResolver = CanonicalReservationPaymentContextResolver;
function createDefaultPaymentEngine() {
    return new engine_1.PaymentEngine(new validation_1.PaymentValidationPipeline(new validation_1.PaymentRequestValidator(), new validation_1.ReservationValidator(), new validation_1.PricingValidator(), new validation_1.SettlementReadinessValidator(), new validation_1.GatewayReadinessValidator()), new policies_1.PaymentPolicyPipeline(), new processing_1.PaymentProcessingPipeline(), new engine_1.DefaultPaymentAggregateFactory());
}
//# sourceMappingURL=payment-initiation-service.js.map