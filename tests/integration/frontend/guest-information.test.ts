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

  it("renders contact and occupancy-aligned traveller forms", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/guest-information");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Booking contact");
    expect(response.text).toContain("Lead traveller");
    expect(response.text).toContain("Traveller 2");
    expect(response.text).toContain('autocomplete="email"');
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

    expect(response.status).toBe(422);
    expect(response.text).toContain("A valid contact email is required.");
    expect(response.text).toContain('value="bad-email"');
    expect(response.text).toContain('value="Ava"');
  });

  it("accepts valid guest information and continues to reservation review", async (): Promise<void> => {
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

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/ui/journeys/journey-homepage-journey-001/review");

    const review = await getRequest(response.headers.location);
    expect(review.status).toBe(200);
    expect(review.text).toContain("Reservation review");
    expect(review.text).toContain("Confirm and continue to payment");
  });
});
