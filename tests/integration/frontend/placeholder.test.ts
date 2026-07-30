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
		expect(response.text).toContain('aria-label="Primary Navigation"');
		expect(response.text).toContain("Go Cape Tours");
		expect(response.text).toContain("Wine Tours");
		expect(response.text).toContain("Day Tours");
		expect(response.text).toContain("Cape Packages");
		expect(response.text).toContain("Garden Route");
		expect(response.text).toContain("Safari Packages");
		expect(response.text).toContain("About");
		expect(response.text).toContain("Contact");
		expect(response.text).toContain("Book Now");
		expect(response.text).toContain('aria-controls="global-navigation-menu"');
		expect(response.text).toContain('aria-expanded="false"');
		expect(response.text).toContain("/css/app.css");
		expect(response.text).toContain("/js/components/navigation.js");
		expect(response.text).toContain("/js/app.js");
	});
});
