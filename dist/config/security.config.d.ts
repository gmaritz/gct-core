export interface SecurityConfig {
    corsEnabled: boolean;
    trustedProxy: boolean | string;
    anonymousSessionLifetimeSeconds: number;
    anonymousSessionCookieSecure: boolean;
}
export declare function createSecurityConfig(corsEnabled: boolean, environment: string, anonymousSessionLifetimeSeconds: number, trustedProxy?: boolean | string, developmentIngress?: boolean): SecurityConfig;
//# sourceMappingURL=security.config.d.ts.map