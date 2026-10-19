import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, getCsrfToken } from "../../helpers/request.helper";

describe("Frontend journey quote", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
    postRequest = createRequest(app, "post");
    const csrfToken = await getCsrfToken(app);
    await postRequest("/ui/journeys/journey-homepage-journey-001/accommodation")
      .set("X-CSRF-Token", csrfToken)
      .type("form")
      .send({
        "selections[0][accommodationId]": "cape-winelands",
        "selections[0][roomReference][provider]": "curated",
        "selections[0][roomReference][opaqueReference]": "cape-winelands-room-1",
        "selections[0][rateReference][provider]": "curated",
        "selections[0][rateReference][opaqueReference]": "cape-winelands-rate-1",
      });
  });

  it("does not return a quote without current accommodation availability", async (): Promise<void> => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-001/quote");

    expect(response.status).toBe(409);
    expect(response.text).toContain("This journey or its accommodation is no longer available.");
    expect(response.text).not.toContain("ZAR 18950.00");
    expect(response.text).not.toContain("Booking confirmed");
  });

  it("handles an unknown journey through the existing not-found response", async (): Promise<void> => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-999/quote");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page unavailable");
  });
});
