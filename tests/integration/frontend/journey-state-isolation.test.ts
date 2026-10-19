import express, { NextFunction, Request, Response } from "express";
import request from "supertest";

import {
	AnonymousSessionRecord,
	AnonymousSessionRepository,
	AnonymousSessionService,
	NewAnonymousSessionRecord,
} from "../../../src/application/sessions";
import {
	AccommodationSelectionInput,
	DefaultAccommodationSelectionService,
	DefaultDynamicHomepageJourneySelector,
	DefaultGuestInformationService,
	DefaultJourneyQuoteService,
	DefaultReservationReviewService,
	GuestInformationInput,
	GuestInformationStore,
	JourneyBookingContext,
	JourneySelectionStore,
} from "../../../src/application/merchandising/homepage/showcase";
import { Journey, JourneyLifecycle, JourneyStatus } from "../../../src/application/journeys";
import { createPricingEngineResult } from "../../../src/application/pricing";
import {
	AnonymousSessionCookiePolicy,
	createAnonymousSessionMiddleware,
	requireAnonymousSession,
} from "../../../src/interfaces/http/middleware/anonymous-session.middleware";
import { UnauthorizedError } from "../../../src/interfaces/http/errors";

interface MutableSessionRecord extends AnonymousSessionRecord {
	tokenHash: string;
	revokedAt?: Date;
	expiresAt: Date;
}

class TestSessionRepository implements AnonymousSessionRepository {
	private readonly records = new Map<string, MutableSessionRecord>();

	public async create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord> {
		const created: MutableSessionRecord = { ...record, id: `owner-${this.records.size + 1}` };
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
		if (record && !record.revokedAt) record.revokedAt = revokedAt;
	}

	public expire(id: string): void {
		const record = this.records.get(id);
		if (!record) throw new Error("Test session was not found.");
		record.expiresAt = new Date(0);
	}
}

const cookiePolicy: AnonymousSessionCookiePolicy = {
	cookieName: "gct.sid",
	cookiePath: "/ui",
	sameSite: "lax",
	secure: false,
	lifetimeSeconds: 3600,
};

const journeyId = "journey-homepage-journey-001";
const bookingContext: JourneyBookingContext = {
	startDate: "2026-11-01",
	participants: 2,
	roomAdults: [2],
};

function journeyFor(ownerId: string): Journey {
	return Journey.create({
		identity: { id: journeyId },
		classification: { type: "PACKAGE", category: "SIGNATURE" },
		metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "TEST" },
		status: JourneyStatus.DRAFT,
		lifecycle: JourneyLifecycle.DESIGN,
		duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
		destinations: [{ name: "Cape Winelands" }],
		accommodation: [{
			accommodationId: `property-${ownerId}`,
			name: "Private Test Property",
			packageStop: {
				packageId: journeyId,
				stopId: "test-stop",
				stopOrder: 1,
				checkInDate: new Date("2026-11-01T00:00:00.000Z"),
				checkOutDate: new Date("2026-11-02T00:00:00.000Z"),
			},
			requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
			roomOptions: [{
				reference: { provider: "test", opaqueReference: `room-${ownerId}` },
				name: "Test Room",
				rateOptions: [{
					reference: { provider: "test", opaqueReference: `rate-${ownerId}` },
					status: "BOOKABLE",
					pricing: { amount: 1000, currency: "ZAR", basis: "PER_STAY" },
					occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
					cancellationPolicies: [],
					taxes: [],
				}],
			}],
		}],
		experiences: [],
		travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
		tags: [],
	});
}

function guestFor(email: string): GuestInformationInput {
	const [firstName] = email.split("@");
	return {
		contact: { email },
		leadTravellerIndex: 0,
		travellers: [
			{ firstName: firstName!, lastName: "Test", email, travellerType: "ADULT" },
			{ firstName: "Second", lastName: "Test", email: `second-${email}`, travellerType: "ADULT" },
		],
	};
}

function createTestApplication(sessionService: AnonymousSessionService) {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	const selectionStore = new JourneySelectionStore();
	const guestStore = new GuestInformationStore();
	const resolver = {
		resolve: async (ownerId: string, publicJourneyId: string, selection?: JourneyBookingContext) => {
			if (publicJourneyId !== journeyId) return { status: "NOT_FOUND" as const };
			if (selection) selectionStore.configure(ownerId, publicJourneyId, selection);
			if (!selectionStore.context(ownerId, publicJourneyId)) return { status: "UNAVAILABLE" as const };
			let offered = selectionStore.offeredJourney(ownerId, publicJourneyId);
			if (!offered) {
				offered = journeyFor(ownerId);
				selectionStore.saveOfferedJourney(ownerId, publicJourneyId, offered);
			}
			return { status: "RESOLVED" as const, journey: offered };
		},
	};
	const pricingEngine = {
		execute: async (pricingRequest: { requestId?: string }) => createPricingEngineResult({
			successful: true,
			pricing: {} as never,
			metadata: {
				completedAt: new Date(),
				version: "test",
				requestId: pricingRequest.requestId ?? "test-quote",
				stages: [],
			},
		}),
	};
	const quoteService = new DefaultJourneyQuoteService(resolver, pricingEngine as never, selectionStore);
	const guestService = new DefaultGuestInformationService(resolver);
	const reviewService = new DefaultReservationReviewService(resolver, guestService, quoteService, guestStore);
	let protectedReads = 0;

	app.get("/without-session/:journeyId", (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			protectedReads += 1;
			response.json({ state: guestStore.find(ownerId, request.params.journeyId) });
		} catch (error) {
			next(error);
		}
	});

	app.use("/ui", createAnonymousSessionMiddleware(sessionService, cookiePolicy));
	app.get("/ui/csrf", (request, response) => {
		response.json({
			ownerId: requireAnonymousSession(request).ownerId,
			csrfToken: response.locals.csrfToken,
		});
	});
	app.post("/ui/journeys/:journeyId/select", async (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			guestStore.clear(ownerId, request.params.journeyId);
			const selection = request.body as JourneyBookingContext;
			const result = await new DefaultDynamicHomepageJourneySelector(resolver)
				.selectJourney(ownerId, request.params.journeyId, selection);
			response.json(result);
		} catch (error) {
			next(error);
		}
	});
	app.post("/ui/journeys/:journeyId/accommodation", async (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			const selections = request.body as ReadonlyArray<AccommodationSelectionInput>;
			const result = await new DefaultAccommodationSelectionService(resolver, selectionStore)
				.selectAccommodation(ownerId, request.params.journeyId, selections);
			response.json({ ...result, selectedStops: result.selectedStops });
		} catch (error) {
			next(error);
		}
	});
	app.get("/ui/journeys/:journeyId/quote", async (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			const quote = await quoteService.priceCurrentJourney(ownerId, request.params.journeyId);
			response.json({
				status: quote.status,
				accommodationIds: quote.selections.map((selection) => selection.accommodationId),
			});
		} catch (error) {
			next(error);
		}
	});
	app.post("/ui/journeys/:journeyId/guest-information", async (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			const input = request.body as GuestInformationInput;
			const result = await guestService.captureGuestInformation(ownerId, request.params.journeyId, input);
			if (result.status === "VALID") guestStore.save(ownerId, request.params.journeyId, input);
			response.json({ status: result.status });
		} catch (error) {
			next(error);
		}
	});
	app.get("/ui/journeys/:journeyId/review", async (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			const guest = guestStore.find(ownerId, request.params.journeyId);
			if (!guest) {
				response.status(422).json({ status: "INVALID" });
				return;
			}
			const result = await reviewService.review({
				ownerId,
				journeyId: request.params.journeyId,
			});
			response.json({
				status: result.status,
				contactEmail: result.guestInformation?.contact.email,
				accommodationIds: result.quote?.selections.map((selection) => selection.accommodationId),
			});
		} catch (error) {
			next(error);
		}
	});
	app.post("/ui/journeys/:journeyId/clear", (request, response, next) => {
		try {
			const ownerId = requireAnonymousSession(request).ownerId;
			selectionStore.clear(ownerId, request.params.journeyId);
			guestStore.clear(ownerId, request.params.journeyId);
			response.status(204).end();
		} catch (error) {
			next(error);
		}
	});
	app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
		response.status(error instanceof UnauthorizedError ? 401 : 500).json({
			error: error instanceof Error ? error.message : "request rejected",
		});
	});

	return { app, sessionService, protectedReadCount: () => protectedReads };
}

describe("Journey state isolation across anonymous sessions", () => {
	it("keeps discovery, selection, quote, guest information, and review scoped to each validated owner", async () => {
		const repository = new TestSessionRepository();
		const sessionService = new AnonymousSessionService(repository, 3600);
		const { app } = createTestApplication(sessionService);
		const ownerA = request.agent(app);
		const ownerB = request.agent(app);
		const sessionA = await ownerA.get("/ui/csrf").expect(200);
		const sessionB = await ownerB.get("/ui/csrf").expect(200);
		const ownerAId = sessionA.body.ownerId as string;
		const ownerBId = sessionB.body.ownerId as string;
		const csrfA = sessionA.body.csrfToken as string;
		const csrfB = sessionB.body.csrfToken as string;
		expect(ownerAId).not.toBe(ownerBId);

		for (const [agent, csrf, startDate] of [
			[ownerA, csrfA, "2026-11-01"],
			[ownerB, csrfB, "2026-12-01"],
		] as const) {
			await agent.post(`/ui/journeys/${journeyId}/select`)
				.set("X-CSRF-Token", csrf)
				.send({ ...bookingContext, startDate })
				.expect(200)
				.expect((response) => expect(response.body.status).toBe("SELECTED"));
		}

		const selectionFor = (ownerId: string): AccommodationSelectionInput[] => [{
			accommodationId: `property-${ownerId}`,
			roomReference: { provider: "test", opaqueReference: `room-${ownerId}` },
			rateReference: { provider: "test", opaqueReference: `rate-${ownerId}` },
		}];
		for (const [agent, csrf, ownerId] of [
			[ownerA, csrfA, ownerAId],
			[ownerB, csrfB, ownerBId],
		] as const) {
			await agent.post(`/ui/journeys/${journeyId}/accommodation`)
				.set("X-CSRF-Token", csrf)
				.send(selectionFor(ownerId))
				.expect(200)
				.expect((response) => expect(response.body.status).toBe("COMPLETE"));
		}

		const quoteA = await ownerA.get(`/ui/journeys/${journeyId}/quote`);
		expect(quoteA.status).toBe(200);
		expect(quoteA.body).toEqual({
			status: "PRICED",
			accommodationIds: [`property-${ownerAId}`],
		});
		const quoteB = await ownerB.get(`/ui/journeys/${journeyId}/quote`);
		expect(quoteB.status).toBe(200);
		expect(quoteB.body).toEqual({
			status: "PRICED",
			accommodationIds: [`property-${ownerBId}`],
		});
		await ownerB.get(`/ui/journeys/${journeyId}/review`).expect(422, { status: "INVALID" });

		const guestA = guestFor("owner-a@example.test");
		const guestB = guestFor("owner-b@example.test");
		await ownerA.post(`/ui/journeys/${journeyId}/guest-information`).set("X-CSRF-Token", csrfA).send(guestA)
			.expect(200, { status: "VALID" });
		await ownerB.get(`/ui/journeys/${journeyId}/review`).expect(422, { status: "INVALID" });
		await ownerB.post(`/ui/journeys/${journeyId}/guest-information`).set("X-CSRF-Token", csrfB).send(guestB)
			.expect(200, { status: "VALID" });

		await ownerA.get(`/ui/journeys/${journeyId}/review`).expect(200, {
			status: "READY",
			contactEmail: guestA.contact.email,
			accommodationIds: [`property-${ownerAId}`],
		});
		await ownerB.get(`/ui/journeys/${journeyId}/review`).expect(200, {
			status: "READY",
			contactEmail: guestB.contact.email,
			accommodationIds: [`property-${ownerBId}`],
		});

		await ownerB.post(`/ui/journeys/${journeyId}/select`)
			.set("X-CSRF-Token", csrfB)
			.send({ ...bookingContext, startDate: "2027-01-01" })
			.expect(200);
		await ownerB.get(`/ui/journeys/${journeyId}/review`).expect(422, { status: "INVALID" });
		await ownerA.get(`/ui/journeys/${journeyId}/review`).expect(200, {
			status: "READY",
			contactEmail: guestA.contact.email,
			accommodationIds: [`property-${ownerAId}`],
		});
		await ownerB.post(`/ui/journeys/${journeyId}/accommodation`)
			.set("X-CSRF-Token", csrfB)
			.send(selectionFor(ownerBId))
			.expect(200);
		await ownerB.post(`/ui/journeys/${journeyId}/guest-information`).set("X-CSRF-Token", csrfB).send(guestB)
			.expect(200, { status: "VALID" });

		await ownerB.post(`/ui/journeys/${journeyId}/clear`).set("X-CSRF-Token", csrfB).expect(204);
		await ownerB.get(`/ui/journeys/${journeyId}/review`).expect(422, { status: "INVALID" });
		await ownerA.get(`/ui/journeys/${journeyId}/review`).expect(200, {
			status: "READY",
			contactEmail: guestA.contact.email,
			accommodationIds: [`property-${ownerAId}`],
		});
	});

	it("does not expose previous state after session expiry and rejects missing owner context before reading state", async () => {
		const repository = new TestSessionRepository();
		const sessionService = new AnonymousSessionService(repository, 3600);
		const { app, protectedReadCount } = createTestApplication(sessionService);
		const expiredAgent = request.agent(app);
		const session = await expiredAgent.get("/ui/csrf").expect(200);
		const ownerId = session.body.ownerId as string;
		const csrf = session.body.csrfToken as string;
		await expiredAgent.post(`/ui/journeys/${journeyId}/select`)
			.set("X-CSRF-Token", csrf)
			.send(bookingContext)
			.expect(200);
		await expiredAgent.post(`/ui/journeys/${journeyId}/accommodation`)
			.set("X-CSRF-Token", csrf)
			.send([{
				accommodationId: `property-${ownerId}`,
				roomReference: { provider: "test", opaqueReference: `room-${ownerId}` },
				rateReference: { provider: "test", opaqueReference: `rate-${ownerId}` },
			}])
			.expect(200);
		await expiredAgent.post(`/ui/journeys/${journeyId}/guest-information`)
			.set("X-CSRF-Token", csrf)
			.send(guestFor("expired@example.test"))
			.expect(200, { status: "VALID" });

		repository.expire(ownerId);
		await expiredAgent.get(`/ui/journeys/${journeyId}/review`).expect(422, { status: "INVALID" });
		await expiredAgent.get("/ui/csrf").expect(200).then((response) => {
			expect(response.body.ownerId).not.toBe(ownerId);
		});

		await request(app).get(`/without-session/${journeyId}`).expect(401, { error: "A valid anonymous session is required." });
		expect(protectedReadCount()).toBe(0);
	});
});
