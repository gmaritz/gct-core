import { Express } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";

describe("Frontend payment experience", () => {
  let app: Express;
  let getRequest: ReturnType<typeof createRequest>;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    getRequest = createRequest(app, "get");
    postRequest = createRequest(app, "post");
  });

  it("renders a controlled payment page without trusting browser payment state", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/payment");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Secure payment");
    expect(response.text).toContain("Payment is not available until a confirmed reservation payment context exists.");
    expect(response.text).not.toContain("PayFast");
  });

  it("does not initiate payment without an authoritative reservation context", async (): Promise<void> => {
    const response = await postRequest("/ui/journeys/journey-homepage-journey-001/payment")
      .type("form")
      .send({ amount: "1", currency: "USD", status: "COMPLETED" });

    expect(response.status).toBe(409);
    expect(response.text).toContain("Payment is not available");
    expect(response.text).not.toContain("Payment Complete");
  });

  it("treats provider return as unknown until authoritative state is available", async (): Promise<void> => {
    const response = await getRequest("/ui/journeys/journey-homepage-journey-001/payment/return?payment_status=COMPLETE");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Payment is not available");
    expect(response.text).not.toContain("Payment Complete");
  });

  it("rejects malformed payment journey references consistently", async (): Promise<void> => {
    const payment = await getRequest("/ui/journeys/not-valid/payment");
    const paymentReturn = await getRequest("/ui/journeys/not-valid/payment/return");

    expect(payment.status).toBe(404);
    expect(payment.text).toContain("Page unavailable");
    expect(paymentReturn.status).toBe(404);
    expect(paymentReturn.text).toContain("Page unavailable");
  });
});
