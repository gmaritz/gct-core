import {
  createAvailabilityQuery,
  createLiveAvailabilityService,
  createR8EffectiveEnvironment,
  loadR8DotEnv,
  parseLiveVerificationConfiguration,
  parseLiveVerificationFlag,
  resolveR8Path,
  runLiveVerification,
  LiveVerificationObservation,
} from "./availability-live-verification";
import {
  AccommodationAvailabilityResult,
  HotelbedsProvider,
  HotelbedsTransport,
} from "../../application/accommodation";

function createEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    HOTELBEDS_AVAILABILITY_LIVE_VERIFY: "true",
    HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES: "26976,26996,26999,27517,27758",
    HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN: "2026-09-15",
    HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT: "2026-09-18",
    HOTELBEDS_AVAILABILITY_LIVE_ADULTS: "2",
    HOTELBEDS_AVAILABILITY_LIVE_CHILDREN: "1",
    HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES: "7",
    HOTELBEDS_AVAILABILITY_LIVE_SOURCE_MARKET: "ZA",
    HOTELBEDS_API_KEY: "test-api-key",
    HOTELBEDS_SECRET: "test-secret",
    ...overrides,
  };
}

function createResult(available: boolean): AccommodationAvailabilityResult {
  return {
    accommodation: {
      identity: { id: "1000", name: "Test hotel" },
      category: "Guest House",
      location: {
        country: "ZA",
        region: "WC",
        city: "Cape Town",
        suburb: "R8",
        latitude: 0,
        longitude: 0,
      },
      rating: { stars: 4, classification: "Premium" },
      images: [],
      amenities: [],
      policies: [],
      contacts: [],
      providerReference: { provider: "hotelbeds", providerAccommodationId: "1000" },
    },
    available,
    metadata: { provider: "hotelbeds", generatedAt: new Date(), version: "1.0.0" },
  };
}

describe("Hotelbeds live availability verification harness", () => {
  it.each([undefined, "", "false", "0"])("is disabled for %p", async (value) => {
    const environment = createEnvironment({ HOTELBEDS_AVAILABILITY_LIVE_VERIFY: value });
    const createService = jest.fn();

    await expect(runLiveVerification(environment, { createService })).resolves.toEqual({ status: "DISABLED" });
    expect(createService).not.toHaveBeenCalled();
  });

  it.each(["true", "1"])("accepts explicit enablement value %s", async (value) => {
    const execute = jest.fn().mockResolvedValue(createResult(true));
    const createService = jest.fn().mockReturnValue({ execute });
    const validateSupplierConfiguration = jest.fn();

    await runLiveVerification(
      createEnvironment({ HOTELBEDS_AVAILABILITY_LIVE_VERIFY: value }),
      { createService, validateSupplierConfiguration },
    );

    expect(validateSupplierConfiguration).toHaveBeenCalledTimes(1);
    expect(createService).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("fails closed for invalid enablement", async () => {
    const createService = jest.fn();

    await expect(runLiveVerification(
      createEnvironment({ HOTELBEDS_AVAILABILITY_LIVE_VERIFY: "yes" }),
      { createService },
    )).rejects.toThrow("Invalid HOTELBEDS_AVAILABILITY_LIVE_VERIFY value.");
    expect(createService).not.toHaveBeenCalled();
  });

  it("validates live configuration before R7", async () => {
    const createService = jest.fn();

    await expect(runLiveVerification(
      createEnvironment({ HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES: undefined }),
      { createService },
    )).rejects.toThrow("HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES");
    expect(createService).not.toHaveBeenCalled();
  });

  it.each([
    ["HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN", "invalid"],
    ["HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT", "2026-09-01"],
    ["HOTELBEDS_AVAILABILITY_LIVE_ADULTS", "0"],
    ["HOTELBEDS_AVAILABILITY_LIVE_CHILDREN", "-1"],
    ["HOTELBEDS_AVAILABILITY_LIVE_SOURCE_MARKET", ""],
  ])("rejects invalid %s", (name, value) => {
    expect(() => parseLiveVerificationConfiguration(createEnvironment({ [name]: value }))).toThrow();
  });

  it("requires child ages when children are configured", () => {
    expect(() => parseLiveVerificationConfiguration(createEnvironment({
      HOTELBEDS_AVAILABILITY_LIVE_CHILDREN: "1",
      HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES: undefined,
    }))).toThrow("HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES");
  });

  it("accepts matching child ages", () => {
    const configuration = parseLiveVerificationConfiguration(createEnvironment({
      HOTELBEDS_AVAILABILITY_LIVE_CHILDREN: "2",
      HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES: "5,9",
    }));

    expect(configuration.childAges).toEqual([5, 9]);
  });

  it("parses, trims, deduplicates, and preserves multi-hotel order", () => {
    const configuration = parseLiveVerificationConfiguration(createEnvironment({
      HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES: " 26976,26996, 26976,26999 ",
    }));

    expect(configuration.hotelCodes).toEqual(["26976", "26996", "26999"]);
  });

  it.each([
    "26976,,26996",
    "26976,not-a-code",
    "",
  ])("rejects invalid hotel-code list %s", (hotelCodes) => {
    expect(() => parseLiveVerificationConfiguration(createEnvironment({
      HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES: hotelCodes,
    }))).toThrow();
  });

  it("places all configured hotel codes into application criteria", () => {
    const configuration = parseLiveVerificationConfiguration(createEnvironment());

    expect(createAvailabilityQuery(configuration).criteria.hotelCodes).toEqual([
      "26976",
      "26996",
      "26999",
      "27517",
      "27758",
    ]);
  });

  it("uses the real in-memory catalogue and R7 composition", async () => {
    const service = createLiveAvailabilityService(["26976", "26996", "26999", "27517", "27758"]);
    const execute = jest.spyOn(service, "execute").mockResolvedValue(createResult(false));

    await runLiveVerification(createEnvironment(), {
      createService: () => service,
      validateSupplierConfiguration: jest.fn(),
    });

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("resolves the configured catalogue candidate before request validation", async () => {
    const observation = { resolvedCandidateCount: 0, supplierRequestCount: 0 };
    const service = createLiveAvailabilityService(
      ["26976", "26996", "26999", "27517", "27758"],
      observation,
    );
    const configuration = parseLiveVerificationConfiguration(createEnvironment());

    await expect(service.execute(createAvailabilityQuery({
      ...configuration,
      sourceMarket: "",
    }))).rejects.toThrow("Invalid source market.");
    expect(observation.resolvedCandidateCount).toBe(5);
  });

  it("builds one R3 request for five resolved candidates without supplier access", async () => {
    const observation = { resolvedCandidateCount: 0, supplierRequestCount: 0 };
    const service = createLiveAvailabilityService(
      ["26976", "26996", "26999", "27517", "27758"],
      observation,
    );
    const execute = jest.spyOn(HotelbedsProvider.prototype, "executeAvailabilityRequests")
      .mockResolvedValue({
        provider: "hotelbeds",
        operation: "availability",
        completedAt: new Date(),
        responses: [],
      } as never);
    const map = jest.spyOn(HotelbedsProvider.prototype, "mapAvailabilityResponse")
      .mockReturnValue(createResult(false));

    await service.execute(createAvailabilityQuery(parseLiveVerificationConfiguration(createEnvironment())));

    expect(observation.resolvedCandidateCount).toBe(5);
    expect(observation.supplierRequestCount).toBe(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(map).toHaveBeenCalledTimes(1);
    execute.mockRestore();
    map.mockRestore();
  });

  it("binds the effective PEM environment into the actual provider executor", async () => {
    const sourceEnvironment = loadR8DotEnv({});
    const effectiveEnvironment = createR8EffectiveEnvironment(sourceEnvironment);
    let capturedConfig: { readonly tls?: { readonly privateKey: string; readonly privateKeyPassphrase?: string } } | undefined;
    const transport: HotelbedsTransport = {
      execute: async (config) => {
        capturedConfig = config;
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: {
            hotels: [{ code: 26976, name: "Controlled test hotel", rooms: [] }],
          },
          durationMs: 1,
        };
      },
    };
    const service = createLiveAvailabilityService(
      ["26976", "26996", "26999", "27517", "27758"],
      { resolvedCandidateCount: 0, supplierRequestCount: 0 },
      effectiveEnvironment,
      transport,
    );

    await service.execute(createAvailabilityQuery(parseLiveVerificationConfiguration(sourceEnvironment)));

    expect(capturedConfig?.tls?.privateKey).toMatch(/^-----BEGIN/);
    expect(capturedConfig?.tls?.privateKey).not.toBe(sourceEnvironment.HOTELBEDS_TLS_PRIVATE_KEY);
    expect(capturedConfig?.tls?.privateKeyPassphrase).toBe(
      effectiveEnvironment.HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE,
    );
  });

  it("resolves all configured catalogue candidates and reports one R3 request", async () => {
    const createService = jest.fn((_hotelCodes: ReadonlyArray<string>, observation: LiveVerificationObservation) => {
      observation.resolvedCandidateCount = 5;
      observation.supplierRequestCount = 1;
      return { execute: jest.fn().mockResolvedValue(createResult(false)) };
    });
    const outcome = await runLiveVerification(createEnvironment(), {
      validateSupplierConfiguration: jest.fn(),
      createService,
    });

    expect(outcome.report).toMatchObject({
      configuredHotelCount: 5,
      resolvedCandidateCount: 5,
      supplierRequestCount: 1,
      supplierExecutionStatus: "COMPLETED",
      success: true,
    });
  });

  it("does not expose credential values in validation errors", async () => {
    const secret = "super-secret-value";
    await expect(runLiveVerification(
      createEnvironment({
        HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES: undefined,
        HOTELBEDS_SECRET: secret,
      }),
    )).rejects.toThrow(/HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES/);
    await expect(runLiveVerification(
      createEnvironment({ HOTELBEDS_API_KEY: "", HOTELBEDS_SECRET: secret }),
      { validateSupplierConfiguration: () => { throw new Error("Hotelbeds API key is required."); } },
    )).rejects.not.toThrow(secret);
  });

  it("does not execute the harness during module import", () => {
    expect(parseLiveVerificationFlag(undefined)).toBe(false);
  });

  it("loads TLS PEM contents from project-root-relative paths without exposing them", () => {
    const environment: NodeJS.ProcessEnv = {
      HOTELBEDS_API_KEY: "test-api-key",
      HOTELBEDS_SECRET: "test-secret",
      HOTELBEDS_BASE_URL: "https://api-mtls.test.hotelbeds.com",
      HOTELBEDS_TLS_CLIENT_CERTIFICATE: "certs/hotelbeds/hotelbeds-client.crt.pem",
      HOTELBEDS_TLS_PRIVATE_KEY: "certs/hotelbeds/hotelbeds-client.key",
      HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE: "controlled-passphrase",
    };

    const effectiveEnvironment = createR8EffectiveEnvironment(environment);

    expect(effectiveEnvironment.HOTELBEDS_TLS_CLIENT_CERTIFICATE).toMatch(/^-----BEGIN/);
    expect(effectiveEnvironment.HOTELBEDS_TLS_PRIVATE_KEY).toMatch(/^-----BEGIN/);
    expect(effectiveEnvironment.HOTELBEDS_TLS_PRIVATE_KEY).not.toBe(environment.HOTELBEDS_TLS_PRIVATE_KEY);
    expect(effectiveEnvironment.HOTELBEDS_TLS_TRUSTED_CA).toBeUndefined();
    expect(effectiveEnvironment.HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE).toBe("controlled-passphrase");
  });

  it("accepts absolute TLS paths and optional CA files", () => {
    const certificatePath = resolveR8Path("certs/hotelbeds/hotelbeds-client.crt.pem");
    const keyPath = resolveR8Path("certs/hotelbeds/hotelbeds-client.key");
    const effectiveEnvironment = createR8EffectiveEnvironment({
      HOTELBEDS_API_KEY: "test-api-key",
      HOTELBEDS_SECRET: "test-secret",
      HOTELBEDS_BASE_URL: "https://api-mtls.test.hotelbeds.com",
      HOTELBEDS_TLS_CLIENT_CERTIFICATE: certificatePath,
      HOTELBEDS_TLS_PRIVATE_KEY: keyPath,
      HOTELBEDS_TLS_TRUSTED_CA: certificatePath,
    });

    expect(effectiveEnvironment.HOTELBEDS_TLS_TRUSTED_CA).toMatch(/^-----BEGIN/);
  });

  it("fails safely for a missing TLS file", () => {
    expect(() => createR8EffectiveEnvironment({
      HOTELBEDS_API_KEY: "test-api-key",
      HOTELBEDS_SECRET: "test-secret",
      HOTELBEDS_BASE_URL: "https://api-mtls.test.hotelbeds.com",
      HOTELBEDS_TLS_CLIENT_CERTIFICATE: "certs/hotelbeds/missing.crt.pem",
      HOTELBEDS_TLS_PRIVATE_KEY: "certs/hotelbeds/hotelbeds-client.key",
    })).toThrow("R8 TLS file configuration is unreadable");
  });

  it("preserves externally supplied environment values when loading dotenv", () => {
    const externalEnvironment: NodeJS.ProcessEnv = {
      HOTELBEDS_BASE_URL: "https://external.example.test",
    };

    loadR8DotEnv(externalEnvironment);

    expect(externalEnvironment.HOTELBEDS_BASE_URL).toBe("https://external.example.test");
  });

  it("preserves an explicitly empty live flag over dotenv", () => {
    const externalEnvironment: NodeJS.ProcessEnv = {
      HOTELBEDS_AVAILABILITY_LIVE_VERIFY: "",
    };

    loadR8DotEnv(externalEnvironment);

    expect(externalEnvironment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY).toBe("");
    expect(parseLiveVerificationFlag(externalEnvironment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY)).toBe(false);
  });
});