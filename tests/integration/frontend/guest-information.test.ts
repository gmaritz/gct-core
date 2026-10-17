import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend guest information", () => {
  let app: Express;
  let getRequest: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    getRequest = createRequest(app, "get");
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

  it("does not accept guest details before a live room allocation exists", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/guest-information");

    expect(response.status).toBe(410);
    expect(response.text).toContain("This journey is no longer available");
  });

  it("redisplays invalid submitted values and validation errors", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/guest-information")
      .type("form")
      .send({
        "contact[email]": "bad-email",
        "contact[phone]": "+27112223333",
        leadTravellerIndex: "0",
        "travellers[0][firstName]": "Ava",
        "travellers[0][lastName]": "Cape",
        "travellers[0][email]": "ava@example.com",
        "travellers[0][travellerType]": "ADULT",
      });

    expect(response.status).toBe(410);
    expect(response.text).toContain("This journey is no longer available");
  });

  it("does not continue to review without live accommodation availability", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/guest-information")
      .type("form")
      .send({
        "contact[email]": "contact@example.com",
        "contact[phone]": "+27112223333",
        leadTravellerIndex: "0",
        "travellers[0][firstName]": "Ava",
        "travellers[0][lastName]": "Cape",
        "travellers[0][email]": "ava@example.com",
        "travellers[0][travellerType]": "ADULT",
        "travellers[1][firstName]": "Ben",
        "travellers[1][lastName]": "Cape",
        "travellers[1][email]": "ben@example.com",
        "travellers[1][travellerType]": "ADULT",
      });

    expect(response.status).toBe(410);
    expect(response.text).toContain("This journey is no longer available");
  });
});
