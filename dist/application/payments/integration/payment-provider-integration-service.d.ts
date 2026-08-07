import { PaymentEngineResult } from "../engine";
import { PaymentGatewayResult } from "./models";
import { PaymentGateway } from "./payment-gateway";
import { PaymentGatewayProviderReference } from "./models/payment-provider-reference";
export interface PaymentProviderIntegrationRequest {
    readonly engineResult: PaymentEngineResult;
    readonly providerReference: PaymentGatewayProviderReference;
    readonly amount?: number;
}
export declare class PaymentProviderIntegrationService {
    private readonly gateway;
    constructor(gateway: PaymentGateway);
    authorize(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult>;
    capture(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult>;
    settle(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult>;
    refund(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult>;
    status(request: PaymentProviderIntegrationRequest): Promise<PaymentGatewayResult>;
    private execute;
}
//# sourceMappingURL=payment-provider-integration-service.d.ts.map