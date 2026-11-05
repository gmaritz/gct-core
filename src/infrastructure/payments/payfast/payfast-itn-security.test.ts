import {
  createPayFastItnSignature,
  FetchPayFastItnServerValidator,
  isPayFastItnSourceAddress,
  parsePayFastItnFields,
  PayFastItnRequestError,
  verifyPayFastItnSignature,
} from "./payfast-itn-security";

const signatureVector = "merchant_id=10000100&m_payment_id=GCT+123&pf_payment_id=1089250&payment_status=COMPLETE&item_name=Widget+%26+thing&amount_gross=200.00";
const signatureDigest = "e2c30e3e09dfa8afb43b1bbb6750c73f";

describe("PayFast ITN signature and source security", () => {
  it("matches an independent ordered-field MD5 known-answer vector", () => {
    const fields = parsePayFastItnFields(Buffer.from(`${signatureVector}&signature=${signatureDigest}`));

    expect(createPayFastItnSignature(fields, "p a!")).toBe(signatureDigest);
    expect(verifyPayFastItnSignature(fields, "p a!")).toBe(true);
    expect(verifyPayFastItnSignature(fields, "wrong passphrase")).toBe(false);
  });

  it("preserves field order and does not use alphabetical API ordering", () => {
    const fields = parsePayFastItnFields(Buffer.from(`${signatureVector}&signature=${signatureDigest}`));
    const reordered = [fields[1]!, fields[0]!, ...fields.slice(2)];

    expect(verifyPayFastItnSignature(reordered, "p a!")).toBe(false);
    expect(createPayFastItnSignature(reordered, "p a!")).not.toBe(signatureDigest);
  });

  it("excludes blank values and signature while encoding spaces and special characters", () => {
    const withBlank = parsePayFastItnFields(Buffer.from(
      `merchant_id=10000100&m_payment_id=GCT+123&pf_payment_id=1089250&payment_status=COMPLETE&item_name=Widget+%26+thing&item_description=&amount_gross=200.00&signature=${signatureDigest}`,
    ));
    expect(createPayFastItnSignature(withBlank, "p a!")).toBe(signatureDigest);
    expect(verifyPayFastItnSignature(withBlank, "p a!")).toBe(true);
  });

  it("rejects malformed, duplicate, missing-signature and invalid-signature fields", () => {
    expect(() => parsePayFastItnFields(Buffer.from("m_payment_id=%ZZ"))).toThrow(PayFastItnRequestError);
    expect(() => parsePayFastItnFields(Buffer.from("m_payment_id=one&m_payment_id=two"))).toThrow(PayFastItnRequestError);
    const missing = parsePayFastItnFields(Buffer.from("merchant_id=10000100"));
    expect(verifyPayFastItnSignature(missing, "p a!")).toBe(false);
    const invalid = parsePayFastItnFields(Buffer.from(`${signatureVector}&signature=xyz`));
    expect(verifyPayFastItnSignature(invalid, "p a!")).toBe(false);
  });

  it("accepts documented PayFast source ranges and IPv4-mapped IPv6", () => {
    expect(isPayFastItnSourceAddress("197.97.145.144")).toBe(true);
    expect(isPayFastItnSourceAddress("41.74.179.223")).toBe(true);
    expect(isPayFastItnSourceAddress("102.216.36.143")).toBe(true);
    expect(isPayFastItnSourceAddress("144.126.193.139")).toBe(true);
    expect(isPayFastItnSourceAddress("::ffff:197.97.145.144")).toBe(true);
    expect(isPayFastItnSourceAddress("::ffff:c561:9190")).toBe(true);
    expect(isPayFastItnSourceAddress("203.0.113.8")).toBe(false);
    expect(isPayFastItnSourceAddress("2001:db8::1")).toBe(false);
  });
});

describe("PayFast ITN server-to-server validation", () => {
  it.each([
    ["SANDBOX", "https://sandbox.payfast.co.za/eng/query/validate"],
    ["LIVE", "https://www.payfast.co.za/eng/query/validate"],
  ] as const)("uses the environment-specific HTTPS endpoint for %s", async (environment, expectedUrl) => {
    const raw = Buffer.from("m_payment_id=gct-1&signature=signature");
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "VALID\n" });
    const validator = new FetchPayFastItnServerValidator(1000, fetchMock as unknown as typeof fetch);

    await expect(validator.validate(raw, environment)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new Uint8Array(raw),
      signal: expect.any(AbortSignal),
    }));
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("rejectUnauthorized");
  });

  it("rejects HTTP-only success with any body other than exact VALID", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "INVALID" });
    const validator = new FetchPayFastItnServerValidator(1000, fetchMock as unknown as typeof fetch);
    await expect(validator.validate(Buffer.from("m_payment_id=gct-1"), "SANDBOX")).resolves.toBe(false);
  });

  it("maps network and timeout failures to retryable validation errors", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("network error"));
    const validator = new FetchPayFastItnServerValidator(5, fetchMock as unknown as typeof fetch);
    await expect(validator.validate(Buffer.from("m_payment_id=gct-1"), "SANDBOX"))
      .rejects.toMatchObject({ statusCode: 503 });
  });
});
