import { generateKeyPairSync } from "crypto";

import {
  createHotelbedsSignature,
  DefaultHotelbedsAuthentication,
  HotelbedsClock,
  HotelbedsConfigurationError,
  HotelbedsEnvironment,
  HotelbedsIntegrationConfig,
  HotelbedsIntegrationErrorCode,
  HotelbedsRequest,
  loadHotelbedsIntegrationConfig,
  mapHotelbedsHttpError,
  mapHotelbedsTransportError,
  DefaultHotelbedsGateway,
  FetchHotelbedsTransport,
  HotelbedsTransportError,
  HotelbedsTransportErrorKind,
  HotelbedsTransport,
  HotelbedsHttpsRequestLike,
  HotelbedsHttpsResponse,
} from "@application/accommodation";

const TEST_KEY_PASSPHRASE = "controlled-test-passphrase";
const TEST_UNENCRYPTED_PRIVATE_KEY = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
}).privateKey;
const TEST_ENCRYPTED_PRIVATE_KEY = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: TEST_KEY_PASSPHRASE,
  },
}).privateKey;

function createRequest(overrides?: Partial<HotelbedsRequest>): HotelbedsRequest {
  return {
    operation: "search",
    method: "GET",
    path: "/hotel-api/1.0/hotels",
    query: {
      destination: "CPT",
    },
    ...overrides,
  };
}

function createConfig(overrides?: Partial<HotelbedsIntegrationConfig>): HotelbedsIntegrationConfig {
  return {
    environment: HotelbedsEnvironment.TEST,
    apiKey: "test-api-key",
    secret: "test-secret",
    baseUrl: "https://api.test.hotelbeds.com",
    timeoutMs: 1500,
    ...overrides,
  };
}

function createHttpsResponse(
  statusCode: number,
  body: string,
  headers = { "content-type": "application/json" },
): HotelbedsHttpsResponse {
  return {
    statusCode,
    headers,
    on(event, listener) : HotelbedsHttpsResponse {
      if (event === "data") (listener as (chunk: Buffer) => void)(Buffer.from(body));
      if (event === "end") (listener as () => void)();
      return this;
    },
  };
}

function createHttpsRequest(
  responseFactory: (options: Record<string, unknown>) => HotelbedsHttpsResponse,
): HotelbedsHttpsRequestLike {
  return (options, callback) => {
    const request = {
      on: () => request,
      setTimeout: () => request,
      write: () => true,
      end: () => callback(responseFactory(options as Record<string, unknown>)),
      destroy: () => undefined,
    };
    return request;
  };
}

describe("APP-008.1 Hotelbeds integration foundation", () => {
  describe("configuration", () => {
    it("loads valid configuration from environment variables", () => {
      const config = loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_BASE_URL: "https://api.test.hotelbeds.com",
        HOTELBEDS_TIMEOUT_MS: "4500",
      });

      expect(config.environment).toBe(HotelbedsEnvironment.TEST);
      expect(config.apiKey).toBe("api-key");
      expect(config.secret).toBe("secret-key");
      expect(config.baseUrl).toBe("https://api.test.hotelbeds.com");
      expect(config.timeoutMs).toBe(4500);
    });

    it("fails when api key is missing", () => {
      expect(() =>
        loadHotelbedsIntegrationConfig({
          HOTELBEDS_ENV: "TEST",
          HOTELBEDS_SECRET: "secret-key",
        }),
      ).toThrow(HotelbedsConfigurationError);
    });

    it("fails when secret is missing", () => {
      expect(() =>
        loadHotelbedsIntegrationConfig({
          HOTELBEDS_ENV: "TEST",
          HOTELBEDS_API_KEY: "api-key",
        }),
      ).toThrow(HotelbedsConfigurationError);
    });

    it("fails when base url is invalid", () => {
      expect(() =>
        loadHotelbedsIntegrationConfig({
          HOTELBEDS_ENV: "TEST",
          HOTELBEDS_API_KEY: "api-key",
          HOTELBEDS_SECRET: "secret-key",
          HOTELBEDS_BASE_URL: "not-a-valid-url",
        }),
      ).toThrow(HotelbedsConfigurationError);
    });

    it("fails when timeout is invalid", () => {
      expect(() =>
        loadHotelbedsIntegrationConfig({
          HOTELBEDS_ENV: "TEST",
          HOTELBEDS_API_KEY: "api-key",
          HOTELBEDS_SECRET: "secret-key",
          HOTELBEDS_TIMEOUT_MS: "0",
        }),
      ).toThrow(HotelbedsConfigurationError);
    });

    it("accepts certificate and private key without a trusted CA", () => {
      const config = loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: "cert-pem",
        HOTELBEDS_TLS_PRIVATE_KEY: TEST_UNENCRYPTED_PRIVATE_KEY,
      });

      expect(config.tls).toEqual({
        clientCertificate: "cert-pem",
        privateKey: TEST_UNENCRYPTED_PRIVATE_KEY.trim(),
        privateKeyPassphrase: undefined,
        trustedCa: "",
      });
    });

    it("accepts an unencrypted private key with a passphrase when Node accepts it", () => {
      expect(() => loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: "cert-pem",
        HOTELBEDS_TLS_PRIVATE_KEY: TEST_UNENCRYPTED_PRIVATE_KEY,
        HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE: TEST_KEY_PASSPHRASE,
      })).not.toThrow();
    });

    it("accepts an encrypted private key with the correct passphrase", () => {
      const config = loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: "cert-pem",
        HOTELBEDS_TLS_PRIVATE_KEY: TEST_ENCRYPTED_PRIVATE_KEY,
        HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE: TEST_KEY_PASSPHRASE,
      });

      expect(config.tls?.privateKeyPassphrase).toBe(TEST_KEY_PASSPHRASE);
    });

    it.each([
      ["missing passphrase", undefined],
      ["incorrect passphrase", "wrong-passphrase"],
    ])("rejects an encrypted private key with %s", (_description, passphrase) => {
      expect(() => loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: "cert-pem",
        HOTELBEDS_TLS_PRIVATE_KEY: TEST_ENCRYPTED_PRIVATE_KEY,
        HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE: passphrase,
      })).toThrow(HotelbedsConfigurationError);
    });

    it("rejects invalid private-key material", () => {
      expect(() => loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: "cert-pem",
        HOTELBEDS_TLS_PRIVATE_KEY: "invalid-private-key",
      })).toThrow(HotelbedsConfigurationError);
    });

    it("rejects a passphrase without a private key", () => {
      expect(() => loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE: TEST_KEY_PASSPHRASE,
      })).toThrow(HotelbedsConfigurationError);
    });

    it.each([
      ["HOTELBEDS_TLS_CLIENT_CERTIFICATE", "cert-pem", ""],
      ["HOTELBEDS_TLS_PRIVATE_KEY", "", TEST_UNENCRYPTED_PRIVATE_KEY],
      ["HOTELBEDS_TLS_TRUSTED_CA", "", ""],
    ])("fails safely for incomplete TLS configuration: %s", (variable, certificate, privateKey) => {
      expect(() => loadHotelbedsIntegrationConfig({
        HOTELBEDS_ENV: "TEST",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: certificate,
        HOTELBEDS_TLS_PRIVATE_KEY: privateKey,
        HOTELBEDS_TLS_TRUSTED_CA: variable === "HOTELBEDS_TLS_TRUSTED_CA" ? "ca-pem" : undefined,
      })).toThrow(HotelbedsConfigurationError);
    });

    it("selects production environment by node environment", () => {
      const config = loadHotelbedsIntegrationConfig({
        NODE_ENV: "production",
        HOTELBEDS_API_KEY: "api-key",
        HOTELBEDS_SECRET: "secret-key",
      });

      expect(config.environment).toBe(HotelbedsEnvironment.PRODUCTION);
      expect(config.baseUrl).toBe("https://api.hotelbeds.com");
    });
  });

  describe("authentication", () => {
    it("generates deterministic signature for known input", () => {
      const signature = createHotelbedsSignature("key", "secret", "1700000000");

      expect(signature).toBe("278d74471a3b5267e27221967122169ad26fac349e0fb6a94779cdf050a0d038");
    });

    it("builds authentication headers with controlled timestamp and correlation", () => {
      const fixedClock: HotelbedsClock = {
        now: () => new Date("2026-08-09T00:00:00.000Z"),
      };
      const authentication = new DefaultHotelbedsAuthentication(() => createConfig(), fixedClock);

      const headers = authentication.prepareHeaders(createRequest(), {
        requestId: "req-001",
        correlationId: "corr-001",
      });

      expect(headers["Api-key"]).toBe("test-api-key");
      expect(headers["X-Timestamp"]).toBe("1786233600");
      expect(headers["X-Signature"]).toBe(
        createHotelbedsSignature("test-api-key", "test-secret", "1786233600"),
      );
      expect(headers["X-Correlation-Id"]).toBe("corr-001");
      expect(headers["X-Request-Id"]).toBe("req-001");
    });

    it("changes signature when timestamp changes", () : void => {
      const authenticationA = new DefaultHotelbedsAuthentication(
        () => createConfig(),
        { now: () => new Date("2026-08-09T00:00:00.000Z") },
      );
      const authenticationB = new DefaultHotelbedsAuthentication(
        () => createConfig(),
        { now: () => new Date("2026-08-09T00:00:01.000Z") },
      );

      const signatureA = authenticationA.prepareHeaders(createRequest())["X-Signature"];
      const signatureB = authenticationB.prepareHeaders(createRequest())["X-Signature"];

      expect(signatureA).not.toBe(signatureB);
    });
  });

  describe("transport", () => {
    it("returns successful responses with parsed JSON payload", async () => {
      const transport = new FetchHotelbedsTransport(createHttpsRequest(() =>
        createHttpsResponse(200, JSON.stringify({ hotels: [] })),
      ));

      const response = await transport.execute(createConfig(), {
        method: "GET",
        path: "/hotel-api/1.0/hotels",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ hotels: [] });
      expect(response.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("returns 4xx and 5xx transport responses to be mapped by gateway", async () => {
      const badRequestTransport = new FetchHotelbedsTransport(createHttpsRequest(() =>
        createHttpsResponse(400, JSON.stringify({ error: { code: "INVALID_REQUEST" } })),
      ));
      const providerErrorTransport = new FetchHotelbedsTransport(createHttpsRequest(() =>
        createHttpsResponse(503, JSON.stringify({ error: { code: "UNAVAILABLE" } })),
      ));

      const badRequest = await badRequestTransport.execute(createConfig(), {
        method: "GET",
        path: "/hotel-api/1.0/hotels",
      });
      const providerFailure = await providerErrorTransport.execute(createConfig(), {
        method: "GET",
        path: "/hotel-api/1.0/hotels",
      });

      expect(badRequest.status).toBe(400);
      expect(providerFailure.status).toBe(503);
    });

    it("maps timeout failures", async () => {
      const transport = new FetchHotelbedsTransport((options, callback): ReturnType<HotelbedsHttpsRequestLike> => {
        const request = {
          on: (): ReturnType<HotelbedsHttpsRequestLike> => request,
          setTimeout: (_timeoutMs: number, handler: () => void): ReturnType<HotelbedsHttpsRequestLike> => {
            handler();
            return request;
          },
          write: () => true,
          end: () => undefined,
          destroy: () => undefined,
        };
        void options;
        void callback;
        return request;
      });

      await expect(
        transport.execute(createConfig({ timeoutMs: 1 }), {
          method: "GET",
          path: "/hotel-api/1.0/hotels",
        }),
      ).rejects.toMatchObject({ kind: HotelbedsTransportErrorKind.TIMEOUT });
    });

    it("maps network failures", async () => {
      const transport = new FetchHotelbedsTransport((options, _callback): ReturnType<HotelbedsHttpsRequestLike> => {
        const request = {
          on: (_event: "error", listener: (error: Error) => void): ReturnType<HotelbedsHttpsRequestLike> => {
            const error = new Error("network down") as Error & { code?: string };
            error.code = "ECONNRESET";
            listener(error);
            return request;
          },
          setTimeout: (): ReturnType<HotelbedsHttpsRequestLike> => request,
          write: () => true,
          end: () => undefined,
          destroy: () => undefined,
        };
        void options;
        return request;
      });

      await expect(
        transport.execute(createConfig(), {
          method: "GET",
          path: "/hotel-api/1.0/hotels",
        }),
      ).rejects.toMatchObject({
        kind: HotelbedsTransportErrorKind.NETWORK,
        providerCode: "ECONNRESET",
      });
    });

    it("maps malformed response failures", async () => {
      const transport = new FetchHotelbedsTransport(createHttpsRequest(() =>
        createHttpsResponse(200, "{not-json}"),
      ));

      await expect(
        transport.execute(createConfig(), {
          method: "GET",
          path: "/hotel-api/1.0/hotels",
        }),
      ).rejects.toMatchObject({ kind: HotelbedsTransportErrorKind.MALFORMED_RESPONSE });
    });
  });

  describe("error mapping", () => {
    it("maps authentication error from provider http status", () => {
      const mapped = mapHotelbedsHttpError(401, { error: { code: "AUTH_FAILED", message: "denied" } });

      expect(mapped.code).toBe(HotelbedsIntegrationErrorCode.AUTHENTICATION_ERROR);
      expect(mapped.retryable).toBe(false);
      expect(mapped.providerCode).toBe("AUTH_FAILED");
    });

    it("maps validation, not-found, rate-limit, timeout, provider, malformed response errors", () => {
      expect(mapHotelbedsHttpError(400, {}).code).toBe(HotelbedsIntegrationErrorCode.VALIDATION_ERROR);
      expect(mapHotelbedsHttpError(404, {}).code).toBe(HotelbedsIntegrationErrorCode.NOT_FOUND);
      expect(mapHotelbedsHttpError(429, {}).code).toBe(HotelbedsIntegrationErrorCode.RATE_LIMITED);
      expect(
        mapHotelbedsTransportError(
          new HotelbedsTransportError(HotelbedsTransportErrorKind.TIMEOUT, "timeout"),
        ).code,
      ).toBe(HotelbedsIntegrationErrorCode.TIMEOUT);
      expect(mapHotelbedsHttpError(503, {}).code).toBe(HotelbedsIntegrationErrorCode.PROVIDER_ERROR);
      expect(
        mapHotelbedsTransportError(
          new HotelbedsTransportError(HotelbedsTransportErrorKind.MALFORMED_RESPONSE, "bad"),
        ).code,
      ).toBe(HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE);
    });
  });

  describe("gateway", () => {
    it("returns successful provider call result", async () : Promise<void> => {
      const transport: HotelbedsTransport = {
        execute: async () => ({
          status: 200,
          headers: {},
          body: [{ code: 1, name: "Hotel" }],
          durationMs: 12,
        }),
      };
      const gateway = new DefaultHotelbedsGateway(
        () => createConfig(),
        new DefaultHotelbedsAuthentication(() => createConfig(), { now: () => new Date("2026-08-09T00:00:00.000Z") }),
        transport,
      );

      const result = await gateway.execute<ReadonlyArray<{ code: number; name: string }>>(
        createRequest({ requestId: "req-001", correlationId: "corr-001" }),
      );

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.retryable).toBe(false);
      expect(result.data?.[0]?.code).toBe(1);
      expect(result.metadata.requestId).toBe("req-001");
      expect(result.metadata.correlationId).toBe("corr-001");
      expect(result.providerResponse?.status).toBe(200);
    });

    it("returns canonical provider failure for non-retryable and retryable responses", async () : Promise<void> => {
      const firstTransport: HotelbedsTransport = {
        execute: async () => ({
          status: 401,
          headers: {},
          body: { error: { code: "AUTH_FAILED", message: "denied" } },
          durationMs: 10,
        }),
      };
      const secondTransport: HotelbedsTransport = {
        execute: async () => ({
          status: 429,
          headers: {},
          body: { error: { code: "RATE_LIMIT" } },
          durationMs: 10,
        }),
      };
      const auth = new DefaultHotelbedsAuthentication(() => createConfig(), {
        now: () => new Date("2026-08-09T00:00:00.000Z"),
      });

      const authFailure = await new DefaultHotelbedsGateway(() => createConfig(), auth, firstTransport).execute(createRequest());
      const rateLimitFailure = await new DefaultHotelbedsGateway(() => createConfig(), auth, secondTransport).execute(createRequest());

      expect(authFailure.success).toBe(false);
      expect(authFailure.retryable).toBe(false);
      expect(authFailure.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.AUTHENTICATION_ERROR);

      expect(rateLimitFailure.success).toBe(false);
      expect(rateLimitFailure.retryable).toBe(true);
      expect(rateLimitFailure.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.RATE_LIMITED);
    });

    it("returns malformed response error for unusable success payload", async () : Promise<void> => {
      const transport: HotelbedsTransport = {
        execute: async () => ({
          status: 200,
          headers: {},
          body: "unexpected-string-payload",
          durationMs: 9,
        }),
      };
      const gateway = new DefaultHotelbedsGateway(
        () => createConfig(),
        new DefaultHotelbedsAuthentication(() => createConfig(), {
          now: () => new Date("2026-08-09T00:00:00.000Z"),
        }),
        transport,
      );

      const result = await gateway.execute(createRequest());

      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false);
      expect(result.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE);
    });

    it("keeps credentials and signatures out of public result contracts", async () : Promise<void> => {
      const transport: HotelbedsTransport = {
        execute: async () => ({
          status: 401,
          headers: {},
          body: { error: { message: "invalid credentials" } },
          durationMs: 7,
        }),
      };
      const gateway = new DefaultHotelbedsGateway(
        () => createConfig({ apiKey: "public-key", secret: "private-secret" }),
        new DefaultHotelbedsAuthentication(
          () => createConfig({ apiKey: "public-key", secret: "private-secret" }),
          { now: () => new Date("2026-08-09T00:00:00.000Z") },
        ),
        transport,
      );

      const result = await gateway.execute(createRequest());

      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("private-secret");
      expect(serialized).not.toContain("X-Signature");
      expect(serialized).not.toContain("Api-key");
    });

    it("returns immutable result objects", async () : Promise<void> => {
      const transport: HotelbedsTransport = {
        execute: async () => ({
          status: 200,
          headers: {},
          body: [{ id: "hotel-1" }],
          durationMs: 4,
        }),
      };
      const gateway = new DefaultHotelbedsGateway(
        () => createConfig(),
        new DefaultHotelbedsAuthentication(() => createConfig(), {
          now: () => new Date("2026-08-09T00:00:00.000Z"),
        }),
        transport,
      );

      const result = await gateway.execute(createRequest());

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.errors)).toBe(true);
      expect(Object.isFrozen(result.metadata)).toBe(true);
    });
  });
});
