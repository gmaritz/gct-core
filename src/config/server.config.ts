export interface ServerConfig {
	port: number;
	host: string;
	corsEnabled: boolean;
	requestIdHeader: string;
}

export function createServerConfig(port: number, corsEnabled: boolean): ServerConfig {
	return {
		port,
		host: "0.0.0.0",
		corsEnabled,
		requestIdHeader: "x-request-id",
	};
}
