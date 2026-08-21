import { PaymentGateway, PaymentProviderContext, PaymentGatewayResult } from "@application/payments/integration";
export declare enum PayFastEnvironment {
    SANDBOX = "SANDBOX",
    LIVE = "LIVE"
}
export interface PayFastIntegrationConfig {
    readonly environment: PayFastEnvironment;
    readonly merchantId: string;
    readonly merchantKey: string;
    readonly passphrase: string;
    readonly paymentProcessUrl: string;
    readonly apiBaseUrl: string;
    readonly paymentQueryUrl: string;
    readonly refundQueryUrl: string;
    readonly refundUrl: string;
    readonly returnUrl?: string;
    readonly cancelUrl?: string;
    readonly notifyUrl?: string;
    readonly timeoutMs: number;
    readonly apiVersion?: string;
}
export interface PayFastApiRequest {
    readonly method: "GET" | "POST";
    readonly url: string;
    readonly headers?: Record<string, string>;
    readonly body?: string;
}
export interface PayFastApiResponse {
    readonly status: number;
    readonly ok: boolean;
    readonly body: unknown;
}
export interface PayFastHttpClient {
    execute(request: PayFastApiRequest): Promise<PayFastApiResponse>;
}
export declare class PayFastConfigurationError extends Error {
    readonly code = "PAYFAST_CONFIGURATION_ERROR";
    constructor(message: string);
}
export declare function createPayFastIntegrationConfig(input: PayFastIntegrationConfig): PayFastIntegrationConfig;
export declare function loadPayFastIntegrationConfig(env?: NodeJS.ProcessEnv): PayFastIntegrationConfig;
export declare function defaultPayFastSignature(values: Record<string, string | number | boolean | null | undefined>, passphrase: string): string;
export declare function createPayFastApiSignature(values: Record<string, string | number | boolean | null | undefined>, passphrase: string): string;
export declare function verifyPayFastSignature(payload: Record<string, string | number | boolean | null | undefined>, passphrase: string): boolean;
export interface PayFastITN {
    readonly merchantId?: string;
    readonly paymentId?: string;
    readonly providerPaymentId?: string;
    readonly status?: string;
    readonly amountGross?: string;
    readonly amountFee?: string;
    readonly amountNet?: string;
    readonly signature?: string;
}
export declare function normalizePayFastITN(payload: Record<string, string | number | boolean | null | undefined>): PayFastITN;
export declare const defaultPayFastHttpClient: PayFastHttpClient;
export declare class DefaultPayFastGateway implements PaymentGateway {
    private readonly config;
    private readonly httpClient;
    constructor(config?: PayFastIntegrationConfig, httpClient?: PayFastHttpClient);
    execute(context: PaymentProviderContext): Promise<PaymentGatewayResult>;
    private executeCustomPayment;
    private executeTransactionQuery;
    private executeRefundFlow;
}
export declare const payfast: {
    defaultPayFastSignature: typeof defaultPayFastSignature;
    createPayFastApiSignature: typeof createPayFastApiSignature;
    verifyPayFastSignature: typeof verifyPayFastSignature;
    normalizePayFastITN: typeof normalizePayFastITN;
    loadPayFastIntegrationConfig: typeof loadPayFastIntegrationConfig;
    DefaultPayFastGateway: typeof DefaultPayFastGateway;
};
export default DefaultPayFastGateway;
//# sourceMappingURL=index.d.ts.map