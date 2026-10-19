import { Express } from "express";

import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, getCsrfToken } from "../../helpers/request.helper";

describe("Frontend journey selection", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;
  let postRequestTo: ReturnType<typeof createRequest>;

  beforeAll(async () => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
    postRequestTo = createRequest(app, "post");
  });

  it("keeps detail retrieval on GET and requires booking details before availability", async () => {
    const detail = await requestTo("/ui/journeys/journey-homepage-journey-001");
    const csrfToken = await getCsrfToken(app);
    const selection = await postRequestTo("/ui/journeys/journey-homepage-journey-001/select")
      .set("X-CSRF-Token", csrfToken);

    expect(detail.status).toBe(200);
    expect(detail.text).toContain('method="post"');
    expect(detail.text).toContain('name="startDate"');
    expect(detail.text).toContain("Check live availability");
    expect(selection.status).toBe(422);
    expect(selection.text).toContain("Select a valid journey start date and room allocation.");
  });

  it("handles invalid selection without exposing internal details", async () => {
    const csrfToken = await getCsrfToken(app);
    const response = await postRequestTo("/ui/journeys/not-valid/select")
      .set("X-CSRF-Token", csrfToken);

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page unavailable");
    expect(response.text).not.toContain("JourneyComposition");
  });
});
