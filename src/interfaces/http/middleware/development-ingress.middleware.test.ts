import express, { Express } from "express";
import { request as httpRequest } from "http";
import request from "supertest";
import { createDevelopmentIngressMiddleware, isAllowedDevelopmentIngressRoute } from "./development-ingress.middleware";
import { PAYFAST_ITN_SOURCE_CIDRS, PAYFAST_ITN_SOURCE_IPV4 } from "../../../infrastructure/payments/payfast/payfast-itn-security";
import policy from "../../../../scripts/payfast-sandbox-ngrok-policy.json";

const credential = "a".repeat(64);
const source = "197.97.145.144";
const endpoint = "/api/v1/payfast/itn";

function application(peer?: string): Express {
	const app = express();
	if (peer) {
		app.use((req, _res, next) => {
			Object.defineProperty(req.socket, "remoteAddress", { value: peer, configurable: true });
			next();
		});
	}
	app.use(createDevelopmentIngressMiddleware({ peerAddress: "127.0.0.1", credential }));
	app.post(endpoint, (req, res) => res.status(200).send(req.developmentPayFastSource));
	app.use((_req, res) => res.sendStatus(204));
	return app;
}

async function postRawHeaders(headers: string[]): Promise<number | undefined> {
	const server = application().listen(0, "127.0.0.1");
	try {
		await new Promise<void>((resolve) => server.once("listening", resolve));
		const address = server.address();
		if (!address || typeof address === "string") throw new Error("Expected TCP address.");
		return await new Promise((resolve, reject) => {
			const req = httpRequest({ hostname: "127.0.0.1", port: address.port, method: "POST", path: endpoint,
				headers: ["Host", "localhost", "Content-Length", "0", ...headers] }, (res) => {
				res.resume();
				res.on("end", () => resolve(res.statusCode));
			});
			req.on("error", reject);
			req.end();
		});
	} finally {
		await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
	}
}

describe("development ingress", () => {
	it("requires an authenticated immediate peer and ignores forged forwarding headers", async () => {
		const app = application();
		expect((await request(app).post(endpoint).set("X-Forwarded-For", source)).status).toBe(403);
		expect((await request(app).post(endpoint).set("X-Gct-Ingress-Token", credential)
			.set("X-Gct-Itn-Source-Ip", source).set("X-Forwarded-For", "203.0.113.1")).text).toBe(source);
		expect((await request(application("203.0.113.1")).post(endpoint)
			.set("X-Gct-Ingress-Token", credential).set("X-Gct-Itn-Source-Ip", source)).status).toBe(403);
	});

	it("rejects missing, invalid, duplicate or ambiguous metadata", async () => {
		const app = application();
		for (const [token, address] of [
			["", source], ["b".repeat(64), source], [`${credential},${credential}`, source],
			[credential, ""], [credential, `${source},${source}`], [credential, "invalid"], [credential, "203.0.113.1"],
		]) {
			expect((await request(app).post(endpoint).set("X-Gct-Ingress-Token", token)
				.set("X-Gct-Itn-Source-Ip", address)).status).toBe(403);
		}
		expect(await postRawHeaders(["X-Gct-Ingress-Token", credential, "X-Gct-Ingress-Token", credential,
			"X-Gct-Itn-Source-Ip", source])).toBe(403);
		expect(await postRawHeaders(["X-Gct-Ingress-Token", credential, "X-Gct-Itn-Source-Ip", source,
			"X-Gct-Itn-Source-Ip", source])).toBe(403);
	});

	it("allows only exact customer paths and methods and rejects normalization tricks", async () => {
		const app = application();
		for (const path of ["/ui/placeholder", "/ui/journeys/journey-1", "/ui/journeys/journey-1/payment/return?paymentReference=test",
			"/css/app.css", "/css/pages/payment-experience.css", "/js/app.js", "/images/journeys/cape-winelands-1600x900.webp"]) {
			expect((await request(app).get(path)).status).toBe(204);
		}
		for (const path of ["/docs", "/openapi.json", "/api/v1", "/health", "/hotelbeds/Destination%20Code.docx",
			"/ui//placeholder", "/UI/placeholder", "/ui/%70laceholder", "/ui/journeys/../placeholder",
			"/ui/journeys/journey-1/payment/", "/css/base/../app.css", "/css%2fapp.css"]) {
			expect(isAllowedDevelopmentIngressRoute("GET", path)).toBe(false);
		}
		expect((await request(app).get("/docs")).status).toBe(404);
		expect((await request(app).put("/ui/journeys/journey-1/payment")).status).toBe(404);
	});

	it("keeps the ngrok allowlists and source ranges aligned with application rules", () => {
		const actions = policy.on_http_request[1]!.actions!;
		const config = actions[0]!.config!;
		expect("allow" in config ? config.allow : undefined).toEqual([...PAYFAST_ITN_SOURCE_CIDRS, `${PAYFAST_ITN_SOURCE_IPV4}/32`]);
		const expression = policy.on_http_request[2]!.expressions![0]!;
		const patterns = [...expression.matchAll(/req\.url\.path\.matches\('([^']+)'\)/g)].map((match) => new RegExp(match[1]!));
		expect(patterns).toHaveLength(5);
		for (const path of ["/ui/journeys/journey-1/select", "/ui/journeys/journey-1/payment/return",
			"/css/app.css", "/css/base/reset.css", "/js/app.js", "/images/hero/hero-cape-town-1600x900.webp"]) {
			expect(patterns.some((pattern) => pattern.test(path))).toBe(true);
		}
		for (const path of ["/docs", "/css/base/../app.css", "/ui//placeholder", "/api/v1/payfast/itn/"]) {
			expect(patterns.some((pattern) => pattern.test(path))).toBe(false);
		}
		const getPaths = [
			"/ui/placeholder", "/ui/journeys/journey-1",
			...["accommodation", "quote", "guest-information", "review", "payment", "payment/return", "payment/cancel", "confirmation"]
				.map((suffix) => `/ui/journeys/journey-1/${suffix}`),
			"/css/app.css",
			...["reset", "tokens", "typography"].map((name) => `/css/base/${name}.css`),
			...["container", "site", "header", "footer"].map((name) => `/css/layouts/${name}.css`),
			...["navigation", "journey-card", "homepage-showcase", "button", "card", "forms", "feedback", "price-display", "action-group"]
				.map((name) => `/css/components/${name}.css`),
			...["placeholder", "journey-detail", "accommodation-selection", "journey-quote", "guest-information", "reservation-review", "payment-experience", "booking-confirmation"]
				.map((name) => `/css/pages/${name}.css`),
			"/css/utilities/helpers.css", "/js/app.js", "/js/cape-winelands-booking.js", "/js/cape-winelands-accommodation.js",
			"/js/components/navigation.js", "/js/components/homepage-showcase.js", "/images/favicon.ico",
			"/images/hero/hero-cape-town-1600x900.webp",
			...["cape-winelands", "atlantic-seaboard", "franschhoek-valley"].map((name) => `/images/journeys/${name}-1600x900.webp`),
		];
		for (const path of getPaths) {
			expect(isAllowedDevelopmentIngressRoute("GET", path)).toBe(true);
			expect(path === "/ui/placeholder" || patterns.slice(1).some((pattern) => pattern.test(path))).toBe(true);
			expect(isAllowedDevelopmentIngressRoute("PUT", path)).toBe(false);
		}
		for (const suffix of ["select", "accommodation", "guest-information", "review", "payment"]) {
			const path = `/ui/journeys/journey-1/${suffix}`;
			expect(isAllowedDevelopmentIngressRoute("POST", path)).toBe(true);
			expect(patterns[0]!.test(path)).toBe(true);
		}
		expect(isAllowedDevelopmentIngressRoute("POST", endpoint)).toBe(true);
		expect(isAllowedDevelopmentIngressRoute("GET", endpoint)).toBe(false);
	});
});
