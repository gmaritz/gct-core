export interface SecurityConfig {
	corsEnabled: boolean;
	trustedProxy: boolean;
}

export function createSecurityConfig(corsEnabled: boolean): SecurityConfig {
	return {
		corsEnabled,
		trustedProxy: false,
	};
}
