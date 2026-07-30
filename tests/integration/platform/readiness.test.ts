import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, expectJsonResponse } from "../../helpers/request.helper";
import { TEST_REQUEST_ID } from "../../fixtures";

describe("Platform readiness endpoint", () => {
	let app: Express;
	let requestTo: ReturnType<typeof createRequest>;

	beforeAll(async () => {
		app = await createTestApplication();
		requestTo = createRequest(app, "get");
	});

	it("returns readiness diagnostics for GET /ready", async () => {
		const response = await requestTo("/ready", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectJsonResponse(response, 200);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: expect.any(String),
				database: expect.any(String),
				uptimeSeconds: expect.any(Number),
				timestamp: expect.any(String),
			}),
		);
	});
});
