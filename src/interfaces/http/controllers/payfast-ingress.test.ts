import express from "express";
import request from "supertest";
import { createDevelopmentIngressMiddleware } from "../middleware/development-ingress.middleware";
import { receivePayFastItn } from "./payfast-itn.controller";
import { PayFastItnProcessor } from "../../../infrastructure/payments/payfast/payfast-itn-processor";
import { initialiseLogging } from "../../../bootstrap/logging";

describe("authenticated PayFast ingress integration", () => {
	const original = process.env;
	const credential = "a".repeat(64);
	beforeEach(() => {
		process.env = { ...original, NODE_ENV: "development", PAYFAST_ENVIRONMENT: "SANDBOX",
			PAYFAST_MERCHANT_ID: "10000100", PAYFAST_MERCHANT_KEY: "test-key", PAYFAST_PASSPHRASE: "test-passphrase",
			PAYFAST_PUBLIC_BASE_URL: "https://merchant.example.test", PAYFAST_NOTIFY_URL: "https://merchant.example.test/api/v1/payfast/itn" };
		initialiseLogging();
	});
	afterEach(() => { process.env = original; jest.restoreAllMocks(); });

	it("delivers the authenticated source and acknowledges repeated verified results", async () => {
		const process = jest.spyOn(PayFastItnProcessor.prototype, "process")
			.mockResolvedValueOnce({ status: "APPLIED", paymentReference: "gct-test" })
			.mockResolvedValueOnce({ status: "DUPLICATE", paymentReference: "gct-test" });
		const app = express();
		app.use(createDevelopmentIngressMiddleware({ peerAddress: "127.0.0.1", credential }));
		app.use("/api/v1/payfast/itn", express.raw({ type: "application/x-www-form-urlencoded" }));
		app.post("/api/v1/payfast/itn", receivePayFastItn);
		const send = (): request.Test => request(app).post("/api/v1/payfast/itn").type("form")
			.set("X-Gct-Ingress-Token", credential).set("X-Gct-Itn-Source-Ip", "197.97.145.144")
			.set("X-Forwarded-For", "203.0.113.1").send("field=value");
		expect((await send()).status).toBe(200);
		expect((await send()).status).toBe(200);
		expect(process).toHaveBeenCalledTimes(2);
		expect(process).toHaveBeenCalledWith(Buffer.from("field=value"), "197.97.145.144");
		expect((await request(app).post("/api/v1/payfast/itn").type("form").send("field=value")).status).toBe(403);
		expect(process).toHaveBeenCalledTimes(2);
	});
});
