import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend journey quote", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
    postRequest = createRequest(app, "post");
    await postRequest("/ui/journeys/journey-homepage-journey-001/accommodation")
      .type("form")
      .send({
        "selections[0][accommodationId]": "cape-winelands",
        "selections[0][roomReference][provider]": "curated",
        "selections[0][roomReference][opaqueReference]": "cape-winelands-room-1",
        "selections[0][rateReference][provider]": "curated",
        "selections[0][rateReference][opaqueReference]": "cape-winelands-rate-1",
      });
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
