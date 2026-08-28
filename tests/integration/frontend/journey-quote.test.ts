import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend journey quote", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
  });

  it("renders the authoritative quote for the current selected accommodation", async (): Promise<void> => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-001/quote");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Journey quote");
    expect(response.text).toContain("Cape Winelands Retreat");
    expect(response.text).toContain("ZAR 18950.00");
    expect(response.text).toContain("Price breakdown");
    expect(response.text).not.toContain("Booking confirmed");
  });

  it("handles an unknown journey through the existing not-found response", async (): Promise<void> => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-999/quote");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page unavailable");
  });
});
