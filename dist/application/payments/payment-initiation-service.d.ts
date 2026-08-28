import { PaymentEngine, PaymentEngineRequest } from "./engine";
import { PaymentGatewayProviderReference, PaymentGatewayResult } from "./integration";
import { PaymentGateway } from "./integration/payment-gateway";
import { PaymentStatus } from "./models";
import { ReservationRepository } from "../reservations/repository";
export type PaymentInitiationStatus = "INITIATED" | "PENDING" | "FAILED" | "INVALID" | "UNAVAILABLE" | "COMPLETED" | "CANCELLED" | "UNKNOWN";
export interface PaymentInitiationRequest {
    readonly reservationId: string;
    readonly engineRequest: PaymentEngineRequest;
    readonly providerReference: PaymentGatewayProviderReference;
}
export interface PaymentInitiationResult {
    readonly status: PaymentInitiationStatus;
    readonly reservationId: string;
    readonly paymentId?: string;
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
export declare class UnavailablePaymentContextResolver implements PaymentContextResolver {
    resolveForJourney(_journeyId: string): Promise<PaymentInitiationRequest | null>;
}
export declare class DefaultPaymentInitiationService implements PaymentInitiationService {
    private readonly engine;
    private readonly integration;
    constructor(engine: PaymentEngine, gateway: PaymentGateway);
    initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
}
export declare class CanonicalReservationPaymentContextResolver implements PaymentContextResolver {
    private readonly reservationRepository;
    constructor(reservationRepository: ReservationRepository);
    resolveForJourney(journeyId: string): Promise<PaymentInitiationRequest | null>;
}
export declare function createDefaultPaymentEngine(): PaymentEngine;
//# sourceMappingURL=payment-initiation-service.d.ts.map