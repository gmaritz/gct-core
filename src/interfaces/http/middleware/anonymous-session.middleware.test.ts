import express, { Express } from "express";
import request from "supertest";

import {
	AnonymousSessionRecord,
	AnonymousSessionRepository,
	NewAnonymousSessionRecord,
	AnonymousSessionService,
} from "../../../application/sessions";
import { ForbiddenError } from "../errors";
import {
	AnonymousSessionCookiePolicy,
	clearAnonymousSessionCookie,
	createAnonymousSessionMiddleware,
	invalidateAnonymousSession,
	requireAnonymousSession,
} from "./anonymous-session.middleware";

class InMemoryAnonymousSessionRepository implements AnonymousSessionRepository {
	private readonly records = new Map<string, AnonymousSessionRecord & { tokenHash: string; revokedAt?: Date }>();

	public async create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord> {
		const created = { ...record, id: `owner-${this.records.size + 1}` };
		this.records.set(created.id, created);
		return created;
	}

	public async findActiveByTokenHash(tokenHash: string, now: Date): Promise<AnonymousSessionRecord | null> {
		return [...this.records.values()].find((record) =>
			record.tokenHash === tokenHash && !record.revokedAt && record.expiresAt > now,
		) ?? null;
	}

	public async revokeById(id: string, revokedAt: Date): Promise<void> {
		const record = this.records.get(id);
		if (record && !record.revokedAt) this.records.set(id, { ...record, revokedAt });
	}
}

const cookiePolicy: AnonymousSessionCookiePolicy = {
	cookieName: "gct.sid",
	cookiePath: "/ui",
	sameSite: "lax",
	secure: false,
	lifetimeSeconds: 3600,
};

function createTestApp(
	service: AnonymousSessionService,
	onMutation: () => void = (): void => undefined,
	policy: AnonymousSessionCookiePolicy = cookiePolicy,
): Express {
	const app = express();
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());
	app.use("/ui", createAnonymousSessionMiddleware(service, policy));
	app.get("/ui/owner", (request, response): void => {
		response.type("html").send(
			`<meta name="csrf-token" content="${response.locals.csrfToken}"><span>${request.anonymousSession?.ownerId}</span><span>${request.anonymousSession?.resolution}</span>`,
		);
	});
	app.post("/ui/change", (_request, response): void => {
		onMutation();
		response.status(204).end();
	});
	app.post("/ui/logout", async (request, response, next): Promise<void> => {
		try {
			await invalidateAnonymousSession(request, response, service, policy);
			response.status(204).end();
		} catch (error) {
			next(error);
		}
	});
	app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
		const status = error instanceof ForbiddenError ? 403 : 500;
		response.status(status).json({ status, message: error instanceof Error ? error.message : "failure" });
	});
	return app;
}

describe("anonymous session middleware", () => {
	let app: Express;

	beforeEach(() => {
		app = createTestApp(new AnonymousSessionService(new InMemoryAnonymousSessionRepository(), 3600));
	});

	it("creates a server-owned session and emits a restrictive cookie", async () => {
		const secureApp = createTestApp(
			new AnonymousSessionService(new InMemoryAnonymousSessionRepository(), 3600),
			() => undefined,
			{ ...cookiePolicy, secure: true },
		);
		const response = await request(secureApp)
			.get("/ui/owner?ownerId=client-owner")
			.set("X-Request-Id", "client-request-id")
			.set("X-Owner-Id", "client-owner");

		expect(response.text).toContain("owner-1");
		expect(response.text).toContain("NEW_NO_COOKIE");
		expect(response.text).not.toContain("client-owner");
		expect(response.headers["set-cookie"][0]).toContain("gct.sid=");
		expect(response.headers["set-cookie"][0]).toContain("Path=/ui");
		expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
		expect(response.headers["set-cookie"][0]).toContain("Secure");
		expect(response.headers["set-cookie"][0]).toContain("SameSite=Lax");
		expect(response.text).not.toContain("client-request-id");
	});

	it("accepts a same-session CSRF token and rejects missing or incorrect tokens without mutation", async () => {
		let mutations = 0;
		const csrfApp = createTestApp(
			new AnonymousSessionService(new InMemoryAnonymousSessionRepository(), 3600),
			() => { mutations += 1; },
		);
		const agent = request.agent(csrfApp);
		const page = await agent.get("/ui/owner");
		const token = /csrf-token" content="([^"]+)"/.exec(page.text)?.[1];
		expect(token).toBeDefined();

		await agent.post("/ui/change").expect(403);
		await agent.post("/ui/change").set("X-CSRF-Token", "incorrect").expect(403);
		await agent.post("/ui/change").set("X-CSRF-Token", token!).expect(204);

		expect(mutations).toBe(1);
	});

	it("replaces an unknown client-supplied session ID instead of adopting it", async () => {
		const first = await request(app).get("/ui/owner");
		const firstOwner = /owner-(\d+)/.exec(first.text)?.[0];
		const replacement = await request(app)
			.get("/ui/owner")
			.set("Cookie", `gct.sid=${"A".repeat(43)}`);

		expect(replacement.text).not.toContain(firstOwner);
		expect(replacement.text).toContain("NEW_INVALID_COOKIE");
		expect(replacement.headers["set-cookie"][0]).toContain("gct.sid=");
	});

	it("marks a resolved cookie as the validated session for subsequent requests", async () => {
		const agent = request.agent(app);
		await agent.get("/ui/owner");
		const response = await agent.get("/ui/owner");

		expect(response.text).toContain("owner-1");
		expect(response.text).toContain("VALID_COOKIE");
		expect(response.headers["set-cookie"]).toBeUndefined();
	});

	it("does not create an owner context when session persistence fails", async () => {
		const failingRepository: AnonymousSessionRepository = {
			create: async () => { throw new Error("persistence unavailable"); },
			findActiveByTokenHash: async () => null,
			revokeById: async () => undefined,
		};
		const failingApp = createTestApp(new AnonymousSessionService(failingRepository, 3600));

		const response = await request(failingApp).get("/ui/owner");

		expect(response.status).toBe(500);
		expect(response.text).not.toContain("sessionId");
		expect(response.text).not.toContain("csrfToken");
	});

	it("clears the cookie and rejects the old identifier after invalidation", async () => {
		const agent = request.agent(app);
		const page = await agent.get("/ui/owner");
		const token = /csrf-token" content="([^"]+)"/.exec(page.text)?.[1];
		const logout = await agent.post("/ui/logout").set("X-CSRF-Token", token!);

		expect(logout.status).toBe(204);
		expect(logout.headers["set-cookie"][0]).toContain("Max-Age=0");
		const nextPage = await agent.get("/ui/owner");
		expect(nextPage.text).toContain("owner-2");
	});

	it("fails closed when no trusted owner context exists", () => {
		expect(() => requireAnonymousSession({} as express.Request)).toThrow("valid anonymous session");
	});

	it("uses the configured attributes when clearing an invalidated cookie", () => {
		const response = {
			append: jest.fn(),
		} as unknown as express.Response;

		clearAnonymousSessionCookie(response, cookiePolicy);

		expect(response.append).toHaveBeenCalledWith(
			"Set-Cookie",
			expect.stringContaining("gct.sid=; Path=/ui; Max-Age=0"),
		);
	});
});
