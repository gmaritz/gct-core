import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, getCsrfToken } from "../../helpers/request.helper";
import { getPrismaClient } from "../../../src/bootstrap/prisma";

describe("Frontend reservation review", () => {
  let app: Express;
  let getRequest: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    getRequest = createRequest(app, "get");
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
    await getPrismaClient().customerType.upsert({
      where: { code: "ANONYMOUS_BOOKING" },
      update: { name: "Anonymous Booking Customer", active: true },
      create: { code: "ANONYMOUS_BOOKING", name: "Anonymous Booking Customer", active: true },
    });
  });

  afterAll(async (): Promise<void> => {
    const prisma = getPrismaClient();
    await prisma.reservation.deleteMany({ where: { id: "reservation-journey-homepage-journey-001" } });
    await prisma.customer.deleteMany({ where: { email: "contact@example.com" } });
  });

  it("does not render a review without current dated accommodation offers", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/review");

    expect(response.status).toBe(410);
    expect(response.text).toContain("This journey is no longer available");
  });

  it("does not accept guest information without live accommodation availability", async (): Promise<void> => {
    const csrfToken = await getCsrfToken(app);
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/guest-information")
      .set("X-CSRF-Token", csrfToken)
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

    expect(response.status).toBe(410);
    expect(response.text).toContain("This journey is no longer available");
  });

  it("requires explicit confirmation before payment handoff", async (): Promise<void> => {
    const csrfToken = await getCsrfToken(app);
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/review")
      .set("X-CSRF-Token", csrfToken)
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
    expect(response.text).toContain("Complete guest information before reviewing the reservation.");
  });

  it("does not hand off to payment when guest details were never accepted", async (): Promise<void> => {
    const csrfToken = await getCsrfToken(app);
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/review")
      .set("X-CSRF-Token", csrfToken)
      .type("form")
      .send({
        confirmed: "on",
        "contact[email]": "attacker@example.com",
        leadTravellerIndex: "1",
        "travellers[0][firstName]": "Tampered",
        "travellers[0][lastName]": "Guest",
        "travellers[0][email]": "attacker@example.com",
        "travellers[0][travellerType]": "ADULT",
        "travellers[1][firstName]": "Injected",
        "travellers[1][lastName]": "Guest",
        "travellers[1][email]": "attacker@example.com",
        "travellers[1][travellerType]": "ADULT",
      });

    expect(response.status).toBe(422);
    expect(response.text).toContain("Complete guest information before reviewing the reservation.");
  });
});
