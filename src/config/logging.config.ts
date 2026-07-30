export interface LoggingConfig {
	level: string;
	structured: boolean;
	requestLoggingEnabled: boolean;
}

export function createLoggingConfig(level: string): LoggingConfig {
	return {
		level,
		structured: true,
		requestLoggingEnabled: true,
	};
}
