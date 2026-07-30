import { ConfigurationService } from "./configuration.service";

describe("ConfigurationService", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("groups configuration values into typed sections and preserves defaults", () => {
		process.env.NODE_ENV = "production";
		process.env.PORT = "4000";
		process.env.DATABASE_URL = "postgresql://localhost:5432/gct";
		process.env.LOG_LEVEL = "debug";
		process.env.CORS_ENABLED = "false";

		const service = new ConfigurationService();
		const config = service.getConfiguration();

		expect(config.platform.serviceName).toBe("gct-core");
		expect(config.platform.environment).toBe("production");
		expect(config.server.port).toBe(4000);
		expect(config.database.url).toBe("postgresql://localhost:5432/gct");
		expect(config.logging.level).toBe("debug");
		expect(config.logging.structured).toBe(true);
		expect(config.security.corsEnabled).toBe(false);
	});

	it("uses default values when environment variables are absent", () => {
		delete process.env.NODE_ENV;
		delete process.env.PORT;
		delete process.env.DATABASE_URL;
		delete process.env.LOG_LEVEL;
		delete process.env.CORS_ENABLED;

		const config = new ConfigurationService().getConfiguration();

		expect(config.platform.environment).toBe("development");
		expect(config.server.port).toBe(3000);
		expect(config.database.url).toContain("postgresql://postgres:postgres@localhost:5432/gct_core");
		expect(config.logging.level).toBe("info");
		expect(config.security.corsEnabled).toBe(true);
	});

	it("validates and normalises service access through the loader", () => {
		process.env.NODE_ENV = "test";
		process.env.PORT = "5000";
		process.env.DATABASE_URL = "postgresql://localhost:5432/gct-test";

		const config = new ConfigurationService().getConfiguration();

		expect(config.platform.environment).toBe("test");
		expect(config.server.port).toBe(5000);
		expect(config.database.url).toBe("postgresql://localhost:5432/gct-test");
	});
});
