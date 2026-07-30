export interface DatabaseConfig {
	url: string;
	poolSize: number;
}

export function createDatabaseConfig(url: string): DatabaseConfig {
	return {
		url,
		poolSize: 5,
	};
}
