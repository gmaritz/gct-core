import { ConfigurationService } from "./configuration.service";

describe("ConfigurationService", () => {
	it("groups configuration values into typed sections and preserves defaults", () => {
		process.env.NODE_ENV = "production";
		process.env.PORT = "4000";
		process.env.DATABASE_URL = "postgresql://localhost:5432/gct";

		const service = new ConfigurationService();
		const config = service.getConfiguration();

		expect(config.platform.serviceName).toBe("gct-core");
		expect(config.platform.environment).toBe("production");
		expect(config.server.port).toBe(4000);
		expect(config.database.url).toBe("postgresql://localhost:5432/gct");
		expect(config.logging.structured).toBe(true);
		expect(config.security.corsEnabled).toBe(true);
	});
});
