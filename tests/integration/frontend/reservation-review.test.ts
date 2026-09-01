import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";
import { getPrismaClient } from "../../../src/bootstrap/prisma";

describe("Frontend reservation review", () => {
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

    expect(response.status).toBe(302);
    const review = await getRequest(response.headers.location);
    expect(review.status).toBe(200);
    expect(review.text).toContain("Reservation review");
    expect(review.text).toContain("Cape Winelands Retreat");
    expect(review.text).toContain("contact@example.com");
    expect(review.text).toContain("ZAR 18950.00");
    expect(review.text).toContain("Confirm and continue to payment");
    expect(review.text).not.toContain("Booking confirmed");
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

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/ui/journeys/journey-homepage-journey-001/payment");

    const payment = await getRequest("/ui/journeys/journey-homepage-journey-001/payment");
    expect(payment.status).toBe(200);
    expect(payment.text).toContain("ZAR 18950.00");
    expect(payment.text).not.toContain("Payment is not available");

    const confirmation = await getRequest("/ui/journeys/journey-homepage-journey-001/confirmation");
    expect(confirmation.status).toBe(409);
    expect(confirmation.text).toContain("still being processed");
  });
});
