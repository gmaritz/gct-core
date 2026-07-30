import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";
import { TEST_REQUEST_ID } from "../../fixtures";

describe("OpenAPI foundation", () => {
	let app: Express;
	let requestTo: ReturnType<typeof createRequest>;

	beforeAll(async () => {
		app = await createTestApplication();
		requestTo = createRequest(app, "get");
	});

	it("serves the OpenAPI document", async () => {
		const response = await requestTo("/openapi.json", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.body).toEqual(
			expect.objectContaining({
				openapi: "3.1.0",
				info: expect.objectContaining({
					title: expect.any(String),
					version: expect.any(String),
					description: expect.any(String),
				}),
			}),
		);
	});

	it("serves Swagger UI in development", async () => {
		const response = await requestTo("/docs", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("text/html");
		expect(response.text).toContain("swagger");
	});
});
