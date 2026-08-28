import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend reservation review", () => {
  let app: Express;
  let getRequest: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    getRequest = createRequest(app, "get");
    postRequest = createRequest(app, "post");
  });

  it("renders controlled prerequisites for a direct GET", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/review");

    expect(response.status).toBe(422);
    expect(response.text).toContain("Complete guest information before reviewing the reservation.");
  });

  it("renders the complete review after valid guest information", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/guest-information")
      .type("form")
      .send({
        "contact[email]": "contact@example.com",
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

    expect(response.status).toBe(200);
    expect(response.text).toContain("Reservation review");
    expect(response.text).toContain("Cape Winelands Retreat");
    expect(response.text).toContain("contact@example.com");
    expect(response.text).toContain("ZAR 18950.00");
    expect(response.text).toContain("Confirm and continue to payment");
    expect(response.text).not.toContain("Booking confirmed");
  });

  it("requires explicit confirmation before payment handoff", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/review")
      .type("form")
      .send({
        "contact[email]": "contact@example.com",
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

    expect(response.status).toBe(422);
    expect(response.text).toContain("Confirm the reviewed information before continuing to payment.");
  });

  it("hands off to payment only after explicit confirmation", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/review")
      .type("form")
      .send({
        confirmed: "on",
        "contact[email]": "contact@example.com",
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

    expect(response.status).toBe(200);
    expect(response.text).toContain("Ready for payment");
    expect(response.text).toContain("Payment has not been initiated.");
  });
});
