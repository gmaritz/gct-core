export interface SecurityConfig {
	corsEnabled: boolean;
	trustedProxy: boolean;
	anonymousSessionLifetimeSeconds: number;
	anonymousSessionCookieSecure: boolean;
}

export function createSecurityConfig(
	corsEnabled: boolean,
	environment: string,
	anonymousSessionLifetimeSeconds: number,
): SecurityConfig {
	return {
		corsEnabled,
		trustedProxy: false,
		anonymousSessionLifetimeSeconds,
		anonymousSessionCookieSecure: environment === "production",
	};
}
