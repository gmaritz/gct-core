export interface SecurityConfig {
    corsEnabled: boolean;
    trustedProxy: boolean;
    anonymousSessionLifetimeSeconds: number;
    anonymousSessionCookieSecure: boolean;
}
export declare function createSecurityConfig(corsEnabled: boolean, environment: string, anonymousSessionLifetimeSeconds: number): SecurityConfig;
//# sourceMappingURL=security.config.d.ts.map