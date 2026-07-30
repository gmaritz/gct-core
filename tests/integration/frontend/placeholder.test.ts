import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend placeholder page", () => {
	let app: Express;
	let requestTo: ReturnType<typeof createRequest>;

	beforeAll(async () => {
		app = await createTestApplication();
		requestTo = createRequest(app, "get");
	});

	it("renders the placeholder view shell with shared assets", async () => {
		const response = await requestTo("/ui/placeholder");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("text/html");
		expect(response.text).toContain("GCT Core");
		expect(response.text).toContain("Frontend Architecture Foundation");
		expect(response.text).toContain("/css/app.css");
		expect(response.text).toContain("/js/app.js");
	});
});
