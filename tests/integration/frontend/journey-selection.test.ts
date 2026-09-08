import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend journey selection", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;
  let postRequestTo: ReturnType<typeof createRequest>;

  beforeAll(async () => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
    postRequestTo = createRequest(app, "post");
  });

  it("keeps detail retrieval on GET and accepts selection on POST", async () => {
    const detail = await requestTo("/ui/journeys/journey-homepage-journey-001");
    const selection = await postRequestTo("/ui/journeys/journey-homepage-journey-001/select");

    expect(detail.status).toBe(200);
    expect(detail.text).toContain('method="post"');
    expect(detail.text).toContain("Select this journey");
    expect(selection.status).toBe(200);
    expect(selection.text).toContain("Journey selected");
    expect(selection.text).toContain("Accommodation availability and final package pricing will be confirmed in the subsequent steps.");
  });

  it("handles invalid selection without exposing internal details", async () => {
    const response = await postRequestTo("/ui/journeys/not-valid/select");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page unavailable");
    expect(response.text).not.toContain("JourneyComposition");
  });
});
