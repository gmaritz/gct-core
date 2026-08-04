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
		expect(response.text).toContain("Curated Private Journeys");
		expect(response.text).toContain("Discover South Africa Through Carefully Curated Journeys.");
		expect(response.text).toContain("From the vineyards of Stellenbosch to the coastline of the Garden Route");
		expect(response.text).toContain("Luxury Winelands Escape");
		expect(response.text).toContain("Cape Winelands");
		expect(response.text).toContain("4 Days / 3 Nights");
		expect(response.text).toContain("From R18 950 per couple");
		expect(response.text).toContain("Save 22%");
		expect(response.text).toContain("Ocean & Vineyard Retreat");
		expect(response.text).toContain("Mountain Valley Signature");
		expect(response.text).toContain("Featured Experiences");
		expect(response.text).toContain("Future landing-page sections");
		expect(response.text).toContain('class="homepage-showcase"');
		expect(response.text).toContain('class="homepage-showcase__layout"');
		expect(response.text).toContain('class="homepage-showcase__editorial"');
		expect(response.text).toContain('class="homepage-showcase__journeys"');
		expect(response.text).toContain('class="homepage-showcase__journey-card homepage-showcase__journey-card--primary card"');
		expect(response.text).toContain('class="homepage-showcase__journey-card homepage-showcase__journey-card--secondary card"');
		expect(response.text).toContain('class="container"');
		expect(response.text).toContain('class="homepage-showcase__actions"');
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
		expect(response.text).toContain("/js/components/homepage-showcase.js");
		expect(response.text).toContain("/js/app.js");
		expect(response.text).toContain("Explore Experiences");
		expect(response.text).toContain("Plan Your Journey");
		expect(response.text).toContain("View Journey");
	});
});
