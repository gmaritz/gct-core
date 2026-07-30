import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, expectJsonResponse } from "../../helpers/request.helper";
import { TEST_REQUEST_ID } from "../../fixtures";

describe("Platform version endpoint", () => {
	let app: Express;
	let requestTo: ReturnType<typeof createRequest>;

	beforeAll(async () => {
		app = await createTestApplication();
		requestTo = createRequest(app, "get");
	});

	it("returns version metadata for GET /version", async () => {
		const response = await requestTo("/version", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectJsonResponse(response, 200);
		expect(response.body).toEqual(
			expect.objectContaining({
				service: expect.any(String),
				version: expect.any(String),
				environment: expect.any(String),
				build: expect.any(String),
				timestamp: expect.any(String),
			}),
		);
	});
});
