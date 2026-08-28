import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend accommodation selection", () => {
  let app: Express;
  let getRequest: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    getRequest = createRequest(app, "get");
    postRequest = createRequest(app, "post");
  });

  it("renders available property, room and rate options", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/accommodation");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Accommodation selection");
    expect(response.text).toContain("Cape Winelands Retreat");
    expect(response.text).toContain("Signature Room");
    expect(response.text).toContain("Breakfast Included");
    expect(response.text).toContain("Continue to pricing");
  });

  it("accepts a valid server-validated accommodation selection", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/accommodation")
      .type("form")
      .send({
        "selections[0][accommodationId]": "cape-winelands",
        "selections[0][roomReference][provider]": "curated",
        "selections[0][roomReference][opaqueReference]": "cape-winelands-room-1",
        "selections[0][rateReference][provider]": "curated",
        "selections[0][rateReference][opaqueReference]": "cape-winelands-rate-1",
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Accommodation selection complete");
    expect(response.text).toContain("ready for pricing");
  });

  it("rejects incomplete selection without claiming completion", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/accommodation");

    expect(response.status).toBe(422);
    expect(response.text).toContain("Select accommodation for every stop.");
    expect(response.text).not.toContain("Accommodation selection complete");
  });
});
