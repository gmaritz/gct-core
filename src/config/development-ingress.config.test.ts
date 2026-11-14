import { loadDevelopmentIngressConfig } from "./development-ingress.config";
import { ConfigurationService } from "./configuration.service";

const valid = {
	NODE_ENV: "development",
	PAYFAST_ENVIRONMENT: "SANDBOX",
	GCT_DEV_NGROK_INGRESS: "true",
	GCT_DEV_INGRESS_PEER_IP: "127.0.0.1",
	GCT_DEV_INGRESS_TOKEN: "a".repeat(64),
};

describe("development ingress configuration", () => {
	const original = process.env;
	afterEach(() => { process.env = original; });

	it("requires explicit development, sandbox, loopback and a strong credential", () => {
		expect(loadDevelopmentIngressConfig(valid, "development")?.peerAddress).toBe("127.0.0.1");
		expect(loadDevelopmentIngressConfig({}, "production")).toBeUndefined();
		for (const changes of [
			{ NODE_ENV: "" },
			{ PAYFAST_ENVIRONMENT: "LIVE" }, { PAYFAST_ENVIRONMENT: "" },
			{ GCT_DEV_INGRESS_PEER_IP: "::1" }, { GCT_DEV_INGRESS_TOKEN: "short" },
		]) {
			expect(() => loadDevelopmentIngressConfig({ ...valid, ...changes }, "development")).toThrow();
		}
		expect(() => loadDevelopmentIngressConfig(valid, "production")).toThrow();
		expect(() => loadDevelopmentIngressConfig({ GCT_DEV_NGROK_INGRESS: "yes" }, "development")).toThrow();
	});

	it("disables proxy trust and enables secure cookies only in ingress mode", () => {
		process.env = { ...original, ...valid };
		const config = new ConfigurationService().getConfiguration();
		expect(config.security.trustedProxy).toBe(false);
		expect(config.security.anonymousSessionCookieSecure).toBe(true);
		process.env.GCT_TRUST_PROXY = "true";
		expect(() => new ConfigurationService()).toThrow("GCT_TRUST_PROXY");
		process.env = { ...original, NODE_ENV: "development", GCT_DEV_NGROK_INGRESS: "false", GCT_TRUST_PROXY: "10.0.0.1" };
		expect(new ConfigurationService().getConfiguration().security.trustedProxy).toBe("10.0.0.1");
		process.env.GCT_TRUST_PROXY = "10.0.0.0/8";
		expect(() => new ConfigurationService()).toThrow("GCT_TRUST_PROXY");
	});
});
