import { Express } from "express";
import { Request } from "express";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest } from "../../helpers/request.helper";
import { resolvePayFastItnPeerAddress } from "../../../src/interfaces/http/controllers/payfast-itn.controller";

describe("PayFast ITN route", () => {
  let app: Express;
  let postRequest: ReturnType<typeof createRequest>;

  beforeAll(async (): Promise<void> => {
    app = await createTestApplication();
    postRequest = createRequest(app, "post");
  });

  it("rejects unexpected content type without a customer session or provider processing", async (): Promise<void> => {
    const response = await postRequest("/api/v1/payfast/itn")
      .type("json")
      .send({ m_payment_id: "gct-reference" });

    expect(response.status).toBe(415);
    expect(response.text).toContain("Unsupported notification format.");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("uses the network peer rather than forwarded client-supplied headers", (): void => {
    const request = {
      socket: { remoteAddress: "203.0.113.20" },
      headers: { "x-forwarded-for": "197.97.145.144", "x-real-ip": "197.97.145.144" },
    } as unknown as Request;

    expect(resolvePayFastItnPeerAddress(request)).toBe("203.0.113.20");
  });

  it("uses one forwarded client address only behind an explicitly trusted proxy", (): void => {
    const request = {
      socket: { remoteAddress: "10.20.0.5" },
      headers: { "x-forwarded-for": "197.97.145.144" },
      header: (name: string) => name.toLowerCase() === "x-forwarded-for" ? "197.97.145.144" : undefined,
    } as unknown as import("express").Request;
    const spoofedRequest = {
      ...request,
      socket: { remoteAddress: "203.0.113.20" },
    } as unknown as import("express").Request;
    const chainedRequest = {
      ...request,
      header: () => "197.97.145.144, 203.0.113.20",
    } as unknown as import("express").Request;

    expect(resolvePayFastItnPeerAddress(request, ["10.20.0.5"])).toBe("197.97.145.144");
    expect(resolvePayFastItnPeerAddress(spoofedRequest, ["10.20.0.5"])).toBe("203.0.113.20");
    expect(resolvePayFastItnPeerAddress(chainedRequest, ["10.20.0.5"])).toBe("");
  });

  it("rejects over-sized notifications with 413 before parsing or provider work", async (): Promise<void> => {
    const response = await postRequest("/api/v1/payfast/itn")
      .type("form")
      .send(`payload=${"x".repeat(17 * 1024)}`);

    expect(response.status).toBe(413);
    expect(response.text).toContain("Payment notification is too large.");
    expect(response.text).not.toContain("PayFast");
  });
});
