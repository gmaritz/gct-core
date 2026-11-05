export type PayFastItnEnvironment = "SANDBOX" | "LIVE";
export interface PayFastItnField {
    readonly name: string;
    readonly value: string;
}
export declare class PayFastItnRequestError extends Error {
    readonly statusCode: 400 | 403 | 409 | 503;
    constructor(statusCode: 400 | 403 | 409 | 503, message: string);
}
export declare const PAYFAST_ITN_SOURCE_CIDRS: readonly ["197.97.145.144/28", "41.74.179.192/27", "102.216.36.0/28", "102.216.36.128/28"];
export declare const PAYFAST_ITN_SOURCE_IPV4 = "144.126.193.139";
export declare const PAYFAST_ITN_SOURCE_DOCUMENTATION = "https://developers.payfast.co.za/docs#ports_and_ip_addresses";
export declare function parsePayFastItnFields(rawBody: Buffer): ReadonlyArray<PayFastItnField>;
export declare function createPayFastItnSignature(fields: ReadonlyArray<PayFastItnField>, passphrase: string): string;
export declare function verifyPayFastItnSignature(fields: ReadonlyArray<PayFastItnField>, passphrase: string): boolean;
export declare function isPayFastItnSourceAddress(peerAddress: string): boolean;
export interface PayFastItnServerValidator {
    validate(rawBody: Buffer, environment: PayFastItnEnvironment): Promise<boolean>;
}
export declare class FetchPayFastItnServerValidator implements PayFastItnServerValidator {
    private readonly timeoutMs;
    private readonly fetchImplementation;
    constructor(timeoutMs?: number, fetchImplementation?: typeof fetch);
    validate(rawBody: Buffer, environment: PayFastItnEnvironment): Promise<boolean>;
}
export declare function hashPayFastItnBody(rawBody: Buffer): string;
//# sourceMappingURL=payfast-itn-security.d.ts.map