import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend dynamic journey detail page", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;

  beforeAll(async () => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
  });

  it("renders a reconstructed homepage journey", async () => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-001");

    expect(response.status).toBe(200);
    expect(response.text).toContain("SIGNATURE Cape Winelands Journey");
    expect(response.text).toContain("Cape Winelands Retreat");
    expect(response.text).toContain("Cape Winelands Signature Experience");
    expect(response.text).toContain("Price on request");
    expect(response.text).toContain("Itinerary");
    expect(response.text).toContain("Continue planning");
  });

  it("renders the established not-found response for an invalid journey", async () => {
    const response = await requestTo("/ui/journeys/invalid");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page unavailable");
  });
});