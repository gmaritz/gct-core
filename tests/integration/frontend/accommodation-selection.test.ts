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

  it("does not present accommodation without a dated availability search", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/accommodation");

    expect(response.status).toBe(410);
    expect(response.text).toContain("This journey is no longer available");
    expect(response.text).not.toContain("Cape Winelands Retreat");
  });

  it("rejects fixture room and rate selections without current availability", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/accommodation")
      .type("form")
      .send({
        "selections[0][accommodationId]": "cape-winelands",
        "selections[0][roomReference][provider]": "curated",
        "selections[0][roomReference][opaqueReference]": "cape-winelands-room-1",
        "selections[0][rateReference][provider]": "curated",
        "selections[0][rateReference][opaqueReference]": "cape-winelands-rate-1",
      });

    expect(response.status).toBe(409);
    expect(response.text).toContain("This journey is no longer available");
    expect(response.text).not.toContain("Accommodation selection complete");
  });

  it("rejects incomplete selection without claiming completion", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/accommodation");

    expect(response.status).toBe(409);
    expect(response.text).toContain("This journey is no longer available");
    expect(response.text).not.toContain("Accommodation selection complete");
  });
});
