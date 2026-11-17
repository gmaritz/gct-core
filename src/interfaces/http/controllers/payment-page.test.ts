import { randomUUID } from "crypto";
import { Express } from "express";
import request from "supertest";
import { createExpressApplication } from "../../../bootstrap/express";
import { ConfigurationService } from "../../../config/configuration.service";
import {
	AnonymousSessionRecord, AnonymousSessionRepository, AnonymousSessionService, NewAnonymousSessionRecord,
} from "../../../application/sessions";
import { DefaultDynamicHomepageJourneyResolver } from "../../../application/merchandising";
import {
	CanonicalReservationPaymentContextResolver, DefaultPaymentInitiationService,
	PaymentInitiationRequest, PaymentStatus,
} from "../../../application/payments";
import { PaymentAttemptPrismaRepository } from "../../../infrastructure/persistence/repositories/payment-attempt-prisma.repository";

class MemorySessions implements AnonymousSessionRepository {
	private readonly records: (AnonymousSessionRecord & { tokenHash: string })[] = [];

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

const journeyId = "journey-homepage-journey-001";
const paymentPath = `/ui/journeys/${journeyId}/payment`;
const context: PaymentInitiationRequest = {
	journeyId,
	reservationId: "reservation-1",
	reservationPaymentSnapshot: {
		snapshotId: "payment-snapshot-1",
		capturedAt: new Date("2026-01-01"),
		version: "1",
		paymentStatus: PaymentStatus.CREATED,
		amountReceived: 0,
		balanceOutstanding: 64990.09,
	},
	engineRequest: {
		paymentRequest: {
			reference: { paymentId: "payment-reservation-1", reservationId: "reservation-1" },
			paymentAmount: 64990.09,
			currency: "ZAR",
			status: PaymentStatus.CREATED,
		},
	},
	providerReference: { providerIdentifier: "payfast", reference: "payment-reservation-1" },
};

describe("payment page initiation", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = {
			...originalEnv, NODE_ENV: "development", PAYFAST_ENVIRONMENT: "SANDBOX",
			PAYFAST_MERCHANT_ID: "10000100", PAYFAST_MERCHANT_KEY: "test-key", PAYFAST_PASSPHRASE: "test-passphrase",
			PAYFAST_PUBLIC_BASE_URL: "https://example.test", PAYFAST_NOTIFY_URL: "https://example.test/api/v1/payfast/itn",
		};
		jest.spyOn(DefaultDynamicHomepageJourneyResolver.prototype, "resolve").mockResolvedValue({ status: "RESOLVED" });
		jest.spyOn(CanonicalReservationPaymentContextResolver.prototype, "resolveForJourney").mockResolvedValue(context);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		process.env = originalEnv;
	});

	function app(): Express {
		const config = new ConfigurationService().getConfiguration();
		const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
		return createExpressApplication(config, logger, undefined, new AnonymousSessionService(new MemorySessions(), 3600));
	}

	it("posts the displayed balance with a valid same-session CSRF token and renders the returned hosted fields", async () => {
		const initiate = jest.spyOn(DefaultPaymentInitiationService.prototype, "initiatePayment")
			.mockResolvedValueOnce({
				status: "INITIATED", reservationId: "reservation-1", paymentAttemptId: "attempt-1",
				paymentReference: "gct-reference", amount: 64990.09, currency: "ZAR", errors: [],
				hostedPaymentAction: {
					method: "POST", action: "https://sandbox.payfast.co.za/eng/process",
					fields: { amount: "64990.09", m_payment_id: "gct-reference", signature: "test-signed-value", item_name: "Journey & stay" },
				},
			})
			.mockResolvedValueOnce({
				status: "PENDING", reservationId: "reservation-1", paymentAttemptId: "attempt-1",
				paymentReference: "gct-reference", paymentStatus: PaymentStatus.CREATED, errors: [],
			});
		const agent = request.agent(app());
		const page = await agent.get(paymentPath).expect(200);
		expect(page.text).toContain("ZAR 64990.09");
		expect(page.text).toContain(`method="post" action="${paymentPath}"`);
		expect(page.text).not.toContain('href="#secure-payment"');
		expect(page.text).not.toContain('id="secure-payment"');
		const csrf = /name="_csrf" value="([^"]+)"/.exec(page.text)?.[1];
		expect(csrf).toBeDefined();
		await agent.post(paymentPath).type("form").send({ _csrf: "invalid" }).expect(403);
		await request(app()).post(paymentPath).type("form").send({ _csrf: csrf }).expect(403);
		expect(initiate).not.toHaveBeenCalled();

		const response = await agent.post(paymentPath).type("form").send({ _csrf: csrf }).expect(200);
		expect(initiate).toHaveBeenCalledWith(context);
		expect(response.text).toContain('method="post" action="https://sandbox.payfast.co.za/eng/process"');
		expect(response.text).toContain('name="amount" value="64990.09"');
		expect(response.text).toContain('name="m_payment_id" value="gct-reference"');
		expect(response.text).toContain('name="signature" value="test-signed-value"');
		expect(response.text).toContain('name="item_name" value="Journey &amp; stay"');
		expect(response.text).not.toContain("test-passphrase");

		const repeated = await agent.post(paymentPath).type("form").send({ _csrf: csrf }).expect(200);
		expect(repeated.text).not.toContain('id="secure-payment"');
		expect(repeated.text).not.toContain(`method="post" action="${paymentPath}"`);
	});

	it("shows a safe failure without a hosted or retry form", async () => {
		jest.spyOn(DefaultPaymentInitiationService.prototype, "initiatePayment").mockResolvedValue({
			status: "FAILED", reservationId: "reservation-1", errors: ["provider failure"],
		});
		const agent = request.agent(app());
		const page = await agent.get(paymentPath).expect(200);
		const csrf = /name="_csrf" value="([^"]+)"/.exec(page.text)?.[1];
		const response = await agent.post(paymentPath).type("form").send({ _csrf: csrf }).expect(200);
		expect(response.text).toContain("Payment could not be initiated");
		expect(response.text).not.toContain('id="secure-payment"');
		expect(response.text).not.toContain(`method="post" action="${paymentPath}"`);
		expect(response.text).not.toContain("provider failure");
	});

	it("shows the outstanding balance but does not initiate a full-price charge for a partial balance", async () => {
		const resolver = jest.spyOn(CanonicalReservationPaymentContextResolver.prototype, "resolveForJourney");
		const initiate = jest.spyOn(DefaultPaymentInitiationService.prototype, "initiatePayment");
		const agent = request.agent(app());
		const initial = await agent.get(paymentPath).expect(200);
		const csrf = /name="_csrf" value="([^"]+)"/.exec(initial.text)?.[1];
		resolver.mockResolvedValue({
			...context,
			reservationPaymentSnapshot: { ...context.reservationPaymentSnapshot!, amountReceived: 100, balanceOutstanding: 64890.09 },
		});
		const response = await agent.get(paymentPath).expect(200);
		expect(response.text).toContain("ZAR 64890.09");
		expect(response.text).toContain("Payment is unavailable for this outstanding balance");
		expect(response.text).not.toContain(`method="post" action="${paymentPath}"`);
		await agent.post(paymentPath).type("form").send({ _csrf: csrf }).expect(409);
		expect(initiate).not.toHaveBeenCalled();
	});

	it("renders a correlated browser return without initiating a payment", async () => {
		const initiate = jest.spyOn(DefaultPaymentInitiationService.prototype, "initiatePayment");
		const find = jest.spyOn(PaymentAttemptPrismaRepository.prototype, "findByPaymentReference").mockResolvedValue({
			attemptId: "attempt-1", idempotencyKey: "key", paymentId: "payment-reservation-1",
			reservationId: "reservation-1", paymentReference: "gct-reference", provider: "PAYFAST",
			environment: "SANDBOX", amount: 64990.09, currency: "ZAR", status: PaymentStatus.AUTHORIZATION_REQUESTED,
			createdAt: new Date(), updatedAt: new Date(),
		});
		const response = await request(app()).get(`${paymentPath}/return?paymentReference=gct-reference`).expect(200);
		expect(response.text).toContain("AUTHORIZATION_REQUESTED");
		expect(response.text).toContain("64990.09");
		expect(response.text).not.toContain('id="secure-payment"');
		expect(response.text).not.toContain(`method="post" action="${paymentPath}"`);
		expect(find).toHaveBeenCalledWith("gct-reference");
		expect(initiate).not.toHaveBeenCalled();
	});
});
