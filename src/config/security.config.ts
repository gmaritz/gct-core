export interface SecurityConfig {
	corsEnabled: boolean;
	trustedProxy: boolean | string;
	anonymousSessionLifetimeSeconds: number;
	anonymousSessionCookieSecure: boolean;
}

export function createSecurityConfig(
	corsEnabled: boolean,
	environment: string,
	anonymousSessionLifetimeSeconds: number,
	trustedProxy: boolean | string = true,
	developmentIngress: boolean = false,
): SecurityConfig {
	return {
		corsEnabled,
		trustedProxy,
		anonymousSessionLifetimeSeconds,
		anonymousSessionCookieSecure: environment === "production" || developmentIngress,
	};
}
