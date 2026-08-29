import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend booking confirmation", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
  });

  it("handles an unknown reservation through the controlled not-found state", async (): Promise<void> => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-001/confirmation");

    expect(response.status).toBe(404);
    expect(response.text).toContain("The booking could not be found.");
    expect(response.text).not.toContain("Booking confirmed");
  });

  it("does not accept browser payment status as confirmation", async (): Promise<void> => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-001/confirmation?payment_status=COMPLETE");

    expect(response.status).toBe(404);
    expect(response.text).not.toContain("Your booking is confirmed.");
  });
});
