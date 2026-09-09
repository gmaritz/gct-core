import {
  parseCertificationFlag,
  runCertificationVerification,
} from "./certification-verification";

function createEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    HOTELBEDS_CERTIFICATION_VERIFY: "true",
    HOTELBEDS_API_KEY: "test-api-key",
    HOTELBEDS_SECRET: "test-secret",
    HOTELBEDS_BASE_URL: "https://api.test.hotelbeds.com",
    ...overrides,
  };
}

describe("Hotelbeds certification verification", () => {
  it.each([undefined, "", "false", "0"])("is disabled for %p", async (value) => {
    await expect(runCertificationVerification(createEnvironment({ HOTELBEDS_CERTIFICATION_VERIFY: value })))
      .resolves.toEqual({ status: "DISABLED" });
  });

  it("fails closed for invalid enablement", () => {
    expect(() => parseCertificationFlag("yes")).toThrow("Invalid HOTELBEDS_CERTIFICATION_VERIFY value.");
  });

  it("reports the missing controlled booking scenario without making supplier calls", async () => {
    const result = await runCertificationVerification(createEnvironment());

    expect(result.status).toBe("BLOCKED");
    expect(result.report?.evidence).toMatchObject({
      technical: "PASS",
      security: "BLOCKED",
      availability: "BLOCKED",
      booking: "BLOCKED",
      bookingDetails: "BLOCKED",
      cancellation: "BLOCKED",
    });
    expect(result.report?.evidence.reason).toContain("controlled Hotelbeds booking scenario");
  });

  it("blocks certification when mTLS configuration is absent", async () => {
    const result = await runCertificationVerification(createEnvironment({
      HOTELBEDS_TLS_CLIENT_CERTIFICATE: undefined,
      HOTELBEDS_TLS_PRIVATE_KEY: undefined,
    }));

    expect(result.status).toBe("BLOCKED");
    expect(result.report?.evidence.security).toBe("BLOCKED");
  });
});
