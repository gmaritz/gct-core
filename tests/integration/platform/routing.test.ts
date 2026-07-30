import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, expectJsonResponse } from "../../helpers/request.helper";
import { TEST_REQUEST_ID } from "../../fixtures";

describe("Platform routing", () => {
	let app: Express;
	let requestTo: ReturnType<typeof createRequest>;

	beforeAll(async () => {
		app = await createTestApplication();
		requestTo = createRequest(app, "get");
	});

	it("serves the root endpoint", async () => {
		const response = await requestTo("/", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectJsonResponse(response, 200);
		expect(response.body).toEqual(
			expect.objectContaining({
				service: expect.any(String),
				name: expect.any(String),
				environment: expect.any(String),
			}),
		);
	});

	it("serves the API v1 entrypoint", async () => {
		const response = await requestTo("/api/v1", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectJsonResponse(response, 200);
		expect(response.body).toEqual(
			expect.objectContaining({
				message: "GCT Core API v1",
			}),
		);
	});
});
