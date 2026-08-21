import { gzipSync } from "zlib";

import {
  createHotelbedsSignature,
  DefaultHotelbedsAuthentication,
  DefaultHotelbedsAvailabilityExecutor,
  FetchHotelbedsTransport,
  HotelbedsAvailabilityExecutionResult,
  HotelbedsAvailabilityRequest,
  HotelbedsEnvironment,
  HotelbedsIntegrationConfig,
  HotelbedsTransport,
  HotelbedsTransportError,
  HotelbedsTransportErrorKind,
  HotelbedsTransportRequest,
  HotelbedsHttpsRequestLike,
  HotelbedsHttpsResponse,
} from "@application/accommodation";

function createAvailabilityRequest(
  requestId: string,
  hotelCodes: ReadonlyArray<number>,
): HotelbedsAvailabilityRequest {
  return {
    operation: "availability",
    method: "POST",
    path: "/hotel-api/1.0/hotels",
    requestId,
    body: {
      stay: {
        checkIn: "2026-09-10",
        checkOut: "2026-09-14",
      },
      sourceMarket: "ZA",
      occupancies: [
        {
          rooms: 1,
          adults: 2,
          children: 0,
          paxes: [{ type: "AD" }, { type: "AD" }],
        },
      ],
      hotels: {
        hotel: hotelCodes,
      },
    },
  };
}

function createConfig(overrides: Partial<HotelbedsIntegrationConfig> = {}): HotelbedsIntegrationConfig {
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
  body: Buffer,
  headers: Record<string, string> = { "content-type": "application/json" },
): HotelbedsHttpsResponse {
  return {
    statusCode,
    headers,
    on(event, listener) : HotelbedsHttpsResponse {
      if (event === "data") (listener as (chunk: Buffer) => void)(body);
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

describe("APP-008.3-R4 Hotelbeds availability transport execution", () => {
  it("executes deterministic multi-batch requests via explicit provider availability operation", async () : Promise<void> => {
    const calls: ReadonlyArray<{ path: string; method: string; body: unknown }> = [];
    const transport: HotelbedsTransport = {
      execute: async (_config, request) => {
        (calls as Array<{ path: string; method: string; body: unknown }>).push({
          path: request.path,
          method: request.method,
          body: request.body,
        });
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: { ok: true },
          durationMs: 10,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(
        () => createConfig(),
        { now: () => new Date("2026-08-09T00:00:00.000Z") },
      ),
      transport,
    );

    const requestA = createAvailabilityRequest("req-a", [101, 102]);
    const requestB = createAvailabilityRequest("req-b", [103]);

    const result = await executor.execute([requestA, requestB]);

    expect(calls).toEqual([
      { path: "/hotel-api/1.0/hotels", method: "POST", body: requestA.body },
      { path: "/hotel-api/1.0/hotels", method: "POST", body: requestB.body },
    ]);
    expect(result.responses.map((response) => response.requestIndex)).toEqual([0, 1]);
    expect(result.responses[0]?.request).toEqual(requestA);
    expect(result.responses[1]?.request).toEqual(requestB);
    expect(result.responses.every((response) => response.success)).toBe(true);
  });

  it("returns an empty response set for an empty request collection", async () => {
    const transport: HotelbedsTransport = {
      execute: async () => {
        throw new Error("should not execute");
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
    );

    const result = await executor.execute([]);

    expect(result.responses).toEqual([]);
  });

  it("sends API-key, X-Signature and explicit gzip support headers", async () : Promise<void> => {
    let capturedRequest: HotelbedsTransportRequest | undefined;
    const transport: HotelbedsTransport = {
      execute: async (_config, request) => {
        capturedRequest = request;
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: { ok: true },
          durationMs: 12,
        };
      },
    };

    const now = new Date("2026-08-09T00:00:00.000Z");
    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig(), { now: () => now }),
      transport,
    );

    await executor.execute([createAvailabilityRequest("req-auth", [1001])]);

    const timestamp = Math.floor(now.getTime() / 1000).toString();
    expect(capturedRequest?.headers?.["Api-key"]).toBe("test-api-key");
    expect(capturedRequest?.headers?.["X-Timestamp"]).toBe(timestamp);
    expect(capturedRequest?.headers?.["X-Signature"]).toBe(
      createHotelbedsSignature("test-api-key", "test-secret", timestamp),
    );
    expect(capturedRequest?.headers?.["Accept-Encoding"]).toBe("gzip");
  });

  it("retries retryable supplier failures and succeeds before exhaustion", async () => {
    let attempts = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        attempts += 1;

        if (attempts === 1) {
          return {
            status: 503,
            headers: { "content-type": "application/json" },
            body: { error: { code: "UNAVAILABLE", message: "try later" } },
            durationMs: 11,
          };
        }

        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: { hotels: [] },
          durationMs: 9,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
      { maxAttempts: 3 },
    );

    const result = await executor.execute([createAvailabilityRequest("req-retry", [1001])]);

    expect(attempts).toBe(2);
    expect(result.responses[0]?.success).toBe(true);
    expect(result.responses[0]?.attempts).toBe(2);
  });

  it("stops on non-retryable supplier failures and preserves supplier error payload", async () => {
    let attempts = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        attempts += 1;
        return {
          status: 400,
          headers: { "content-type": "application/json", "x-request-id": "hb-400" },
          body: { error: { code: "INVALID_REQUEST", message: "bad payload" } },
          durationMs: 8,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
      { maxAttempts: 3 },
    );

    const result = await executor.execute([createAvailabilityRequest("req-400", [1001])]);

    expect(attempts).toBe(1);
    expect(result.responses[0]?.success).toBe(false);
    expect(result.responses[0]?.retryable).toBe(false);
    expect(result.responses[0]?.httpStatus).toBe(400);
    expect(result.responses[0]?.headers?.["x-request-id"]).toBe("hb-400");
    expect(result.responses[0]?.supplierError?.code).toBe("INVALID_REQUEST");
    expect(result.responses[0]?.supplierError?.payload).toEqual({
      error: { code: "INVALID_REQUEST", message: "bad payload" },
    });
  });

  it("exhausts retry attempts for retryable failures", async () => {
    let attempts = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        attempts += 1;
        return {
          status: 503,
          headers: { "content-type": "application/json" },
          body: { error: { code: "UNAVAILABLE", message: "still down" } },
          durationMs: 13,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
      { maxAttempts: 2 },
    );

    const result = await executor.execute([createAvailabilityRequest("req-exhaust", [1001])]);

    expect(attempts).toBe(2);
    expect(result.responses[0]?.success).toBe(false);
    expect(result.responses[0]?.attempts).toBe(2);
    expect(result.responses[0]?.retryable).toBe(true);
  });

  it("preserves transport failure information and retries transient transport errors", async () => {
    let attempts = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        attempts += 1;

        if (attempts === 1) {
          throw new HotelbedsTransportError(
            HotelbedsTransportErrorKind.TIMEOUT,
            "timeout",
            "ETIMEDOUT",
          );
        }

        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: { hotels: [] },
          durationMs: 7,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
      { maxAttempts: 2 },
    );

    const result = await executor.execute([createAvailabilityRequest("req-timeout", [1001])]);

    expect(attempts).toBe(2);
    expect(result.responses[0]?.success).toBe(true);
    expect(result.responses[0]?.attempts).toBe(2);
  });

  it("does not retry non-retryable transport failures", async () => {
    let attempts = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        attempts += 1;
        throw new HotelbedsTransportError(
          HotelbedsTransportErrorKind.TLS_CONFIGURATION,
          "missing tls",
        );
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
      { maxAttempts: 3 },
    );

    const result = await executor.execute([createAvailabilityRequest("req-tls", [1001])]);

    expect(attempts).toBe(1);
    expect(result.responses[0]?.success).toBe(false);
    expect(result.responses[0]?.retryable).toBe(false);
    expect(result.responses[0]?.transportFailure?.kind).toBe("TLS_CONFIGURATION");
  });

  it("marks invalid operation requests as non-retryable without invoking transport", async () => {
    let calls = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        calls += 1;
        return {
          status: 200,
          headers: {},
          body: { ok: true },
          durationMs: 0,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
    );

    const invalidRequest = {
      ...createAvailabilityRequest("req-invalid", [1001]),
      operation: "search",
    } as HotelbedsAvailabilityRequest;

    const result = await executor.execute([invalidRequest]);

    expect(calls).toBe(0);
    expect(result.responses[0]?.success).toBe(false);
    expect(result.responses[0]?.errors[0]?.code).toBe("VALIDATION_ERROR");
  });

  it("decompresses explicit gzip transport responses", async () => {
    const compressedBody = gzipSync(
      Buffer.from(JSON.stringify({ hotels: [{ code: 10, name: "Compressed" }] }), "utf8"),
    );

    const transport = new FetchHotelbedsTransport(createHttpsRequest(() =>
      createHttpsResponse(
        200,
        compressedBody,
        { "content-type": "application/json", "content-encoding": "gzip" },
      ),
    ));

    const response = await transport.execute(createConfig(), {
      method: "POST",
      path: "/hotel-api/1.0/hotels",
      body: { request: true },
      headers: { "Accept-Encoding": "gzip" },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hotels: [{ code: 10, name: "Compressed" }] });
  });

  it("passes mTLS material to HTTPS request options", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const transport = new FetchHotelbedsTransport(createHttpsRequest((options) => {
      capturedOptions = options;
      return createHttpsResponse(200, Buffer.from(JSON.stringify({ hotels: [] })));
    }));

    await transport.execute(
      createConfig({
        tls: {
          clientCertificate: "cert-data",
          privateKey: "private-key-data",
          privateKeyPassphrase: "private-key-passphrase",
          trustedCa: "ca-data",
        },
      }),
      {
        method: "POST",
        path: "/hotel-api/1.0/hotels",
        body: { request: true },
      },
    );

    expect(capturedOptions?.cert).toBe("cert-data");
    expect(capturedOptions?.key).toBe("private-key-data");
    expect(capturedOptions?.passphrase).toBe("private-key-passphrase");
    expect(capturedOptions?.ca).toBe("ca-data");
    expect(capturedOptions?.rejectUnauthorized).not.toBe(false);
  });

  it("fails for incomplete mTLS transport configuration", async () => {
    const transport = new FetchHotelbedsTransport(createHttpsRequest(() =>
      createHttpsResponse(200, Buffer.from(JSON.stringify({ hotels: [] }))),
    ));

    await expect(
      transport.execute(
        createConfig({
          tls: {
            clientCertificate: "",
            privateKey: "private-key-data",
            trustedCa: "ca-data",
          },
        }),
        {
          method: "POST",
          path: "/hotel-api/1.0/hotels",
          body: { request: true },
        },
      ),
    ).rejects.toMatchObject({ kind: HotelbedsTransportErrorKind.TLS_CONFIGURATION });
  });

  it("preserves structured raw response boundaries", async () => {
    const transport: HotelbedsTransport = {
      execute: async () => ({
        status: 429,
        headers: { "content-type": "application/json", "x-correlation-id": "corr-hb" },
        body: { error: { code: "RATE_LIMIT", message: "slow down" }, trace: "hb-trace-1" },
        durationMs: 16,
      }),
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => createConfig(),
      new DefaultHotelbedsAuthentication(() => createConfig()),
      transport,
      { maxAttempts: 1 },
    );

    const result: HotelbedsAvailabilityExecutionResult = await executor.execute([
      createAvailabilityRequest("req-raw", [2001]),
    ]);

    const response = result.responses[0];
    expect(response?.requestIndex).toBe(0);
    expect(response?.httpStatus).toBe(429);
    expect(response?.headers).toEqual({ "content-type": "application/json", "x-correlation-id": "corr-hb" });
    expect(response?.body).toEqual({
      error: { code: "RATE_LIMIT", message: "slow down" },
      trace: "hb-trace-1",
    });
    expect(response?.supplierError?.code).toBe("RATE_LIMIT");
    expect(response?.retryable).toBe(true);
  });

  it("applies configured QPS and concurrency protection before supplier execution", async () : Promise<void> => {
    const config = createConfig({
      availabilityMaxQps: 2,
      availabilityMaxConcurrency: 2,
    });
    let now = 0;
    const sleepCalls: number[] = [];
    const started: number[] = [];
    const transport: HotelbedsTransport = {
      execute: async () => {
        now += 100;
        started.push(now);
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: { ok: true },
          durationMs: 1,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => config,
      new DefaultHotelbedsAuthentication(() => config),
      transport,
      {
        maxAttempts: 1,
        maxQps: 2,
        maxConcurrency: 2,
        now: () => now,
        sleep: async (delayMs): Promise<void> => {
          sleepCalls.push(delayMs);
          now += delayMs;
        },
      },
    );

    const result = await executor.execute([
      createAvailabilityRequest("req-qps-1", [3001]),
      createAvailabilityRequest("req-qps-2", [3002]),
      createAvailabilityRequest("req-qps-3", [3003]),
    ]);

    expect(result.responses.map((response) => response.requestIndex)).toEqual([0, 1, 2]);
    expect(result.responses.every((response) => response.success)).toBe(true);
    expect(sleepCalls.length).toBeGreaterThan(0);
    expect(started.length).toBe(3);
  });

  it("preserves retry attempts behind supplier protection and rejects invalid resilience settings", async () : Promise<void> => {
    const config = createConfig({
      availabilityMaxQps: 3,
      availabilityMaxConcurrency: 1,
    });
    let now = 0;
    let attemptCount = 0;
    const transport: HotelbedsTransport = {
      execute: async () => {
        attemptCount += 1;
        if (attemptCount === 1) {
          return {
            status: 503,
            headers: { "content-type": "application/json" },
            body: { error: { code: "UNAVAILABLE", message: "try later" } },
            durationMs: 1,
          };
        }

        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: { ok: true },
          durationMs: 1,
        };
      },
    };

    const executor = new DefaultHotelbedsAvailabilityExecutor(
      () => config,
      new DefaultHotelbedsAuthentication(() => config),
      transport,
      {
        maxAttempts: 2,
        maxQps: 3,
        maxConcurrency: 1,
        now: () => now,
        sleep: async (delayMs): Promise<void> => {
          now += delayMs;
        },
      },
    );

    const result = await executor.execute([createAvailabilityRequest("req-retry-protected", [4001])]);

    expect(result.responses[0]?.success).toBe(true);
    expect(result.responses[0]?.attempts).toBe(2);
    expect(attemptCount).toBe(2);

    await expect(
      new DefaultHotelbedsAvailabilityExecutor(
        () => createConfig({ availabilityMaxQps: 0 }),
        new DefaultHotelbedsAuthentication(() => createConfig()),
        ({ execute: async () => ({ status: 200, headers: {}, body: { ok: true }, durationMs: 1 }) }),
        { maxAttempts: 1, maxQps: 0, maxConcurrency: 1 },
      ).execute([createAvailabilityRequest("req-invalid-qps", [4002])]),
    ).rejects.toThrow("must be a positive integer");
  });
});
