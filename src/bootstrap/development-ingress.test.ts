import { randomUUID } from "crypto";
import request from "supertest";
import { createExpressApplication } from "./express";
import { startHttpServer } from "./application";
import { initialiseLogging } from "./logging";
import { ConfigurationService } from "../config/configuration.service";
import {
	AnonymousSessionRecord, AnonymousSessionRepository, AnonymousSessionService, NewAnonymousSessionRecord,
} from "../application/sessions";
import { createAnonymousSessionMiddleware } from "../interfaces/http/middleware/anonymous-session.middleware";

class MemorySessions implements AnonymousSessionRepository {
	private records: (AnonymousSessionRecord & { tokenHash: string })[] = [];
	public async create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord> {
		const result = { ...record, id: randomUUID() };
		this.records.push(result);
		return result;
	}
	public async findActiveByTokenHash(hash: string, now: Date): Promise<AnonymousSessionRecord | null> {
		return this.records.find((record) => record.tokenHash === hash && record.expiresAt > now) ?? null;
	}
	public async revokeById(): Promise<void> { return; }
}

describe("development ingress application", () => {
	const original = process.env;
	afterEach(() => { process.env = original; });

	it("binds loopback, ignores forwarded protocol, and retains the secure session on return", async () => {
		process.env = { ...original, NODE_ENV: "development", PAYFAST_ENVIRONMENT: "SANDBOX",
			GCT_DEV_NGROK_INGRESS: "true", GCT_DEV_INGRESS_PEER_IP: "127.0.0.1", GCT_DEV_INGRESS_TOKEN: "a".repeat(64),
			GCT_TRUST_PROXY: "false" };
		const config = new ConfigurationService().getConfiguration();
		const sessions = new AnonymousSessionService(new MemorySessions(), 3600);
		const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
		const app = createExpressApplication(config, logger, (application) => {
			application.use("/ui", createAnonymousSessionMiddleware(sessions, {
				cookieName: "gct.sid", cookiePath: "/ui", secure: config.security.anonymousSessionCookieSecure,
				sameSite: "lax", lifetimeSeconds: 3600,
			}));
			application.get("/ui/placeholder", (req, res) => res.json({ owner: req.anonymousSession?.ownerId, protocol: req.protocol }));
			application.get("/ui/journeys/:journeyId/payment/return", (req, res) => res.json({ owner: req.anonymousSession?.ownerId }));
		}, sessions);
		const server = await startHttpServer(app, 0, config.developmentIngress?.peerAddress);
		try {
			expect(server.address()).toMatchObject({ address: "127.0.0.1" });
			const initial = await request(server).get("/ui/placeholder?signature=do-not-log")
				.set("X-Forwarded-Proto", "https").set("X-Request-Id", "untrusted-id")
				.set("X-Gct-Ingress-Token", "a".repeat(64));
			expect(initial.body.protocol).toBe("http");
			const cookie = initial.headers["set-cookie"][0] as string;
			expect(cookie).toEqual(expect.stringContaining("Secure"));
			expect(cookie).toEqual(expect.stringContaining("HttpOnly"));
			expect(cookie).toEqual(expect.stringContaining("SameSite=Lax"));
			expect(cookie).toEqual(expect.stringContaining("Path=/ui"));
			const returned = await request(server).get("/ui/journeys/journey-1/payment/return")
				.set("Cookie", cookie.split(";", 1)[0]!);
			expect(returned.body.owner).toBe(initial.body.owner);
			expect(returned.headers["set-cookie"]).toBeUndefined();
			expect(initial.headers["content-security-policy"]).toContain("form-action 'self' https://sandbox.payfast.co.za");
			expect(initial.headers["content-security-policy"]).not.toContain("https://www.payfast.co.za");
			expect(JSON.stringify(logger.info.mock.calls)).not.toContain("do-not-log");
			expect(JSON.stringify(logger.info.mock.calls)).not.toContain("untrusted-id");
			expect(JSON.stringify(logger.info.mock.calls)).not.toContain("a".repeat(64));
		} finally {
			await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
		}
	});

	it("retains the existing LIVE CSP outside ingress mode", async () => {
		process.env = { ...original, NODE_ENV: "production", PAYFAST_ENVIRONMENT: "LIVE", GCT_DEV_NGROK_INGRESS: "false" };
		const config = new ConfigurationService().getConfiguration();
		const app = createExpressApplication(config, initialiseLogging(), (application) => {
			application.get("/test-csp", (_req, res) => res.sendStatus(204));
		}, new AnonymousSessionService(new MemorySessions(), 3600));
		const response = await request(app).get("/test-csp");
		expect(response.headers["content-security-policy"]).toContain("form-action 'self'");
		expect(response.headers["content-security-policy"]).not.toContain("sandbox.payfast.co.za");
		expect(config.security.anonymousSessionCookieSecure).toBe(true);
	});
});
