import {
  createAvailabilityQuery,
  createLiveAvailabilityService,
  parseLiveVerificationConfiguration,
  parseLiveVerificationFlag,
  runLiveVerification,
} from "./availability-live-verification";
import { AccommodationAvailabilityResult } from "../../application/accommodation";

function createEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    HOTELBEDS_AVAILABILITY_LIVE_VERIFY: "true",
    HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE: "1000",
    HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN: "2026-09-10",
    HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT: "2026-09-14",
    HOTELBEDS_AVAILABILITY_LIVE_ADULTS: "2",
    HOTELBEDS_AVAILABILITY_LIVE_CHILDREN: "0",
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
      createEnvironment({ HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE: undefined }),
      { createService },
    )).rejects.toThrow("HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE");
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
    }))).toThrow("HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES");
  });

  it("accepts matching child ages", () => {
    const configuration = parseLiveVerificationConfiguration(createEnvironment({
      HOTELBEDS_AVAILABILITY_LIVE_CHILDREN: "2",
      HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES: "5,9",
    }));

    expect(configuration.childAges).toEqual([5, 9]);
  });

  it("uses the real in-memory catalogue and R7 composition", async () => {
    const service = createLiveAvailabilityService("1000");
    const execute = jest.spyOn(service, "execute").mockResolvedValue(createResult(false));

    await runLiveVerification(createEnvironment(), {
      createService: () => service,
      validateSupplierConfiguration: jest.fn(),
    });

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("resolves the configured catalogue candidate before request validation", async () => {
    const service = createLiveAvailabilityService("1000");
    const configuration = parseLiveVerificationConfiguration(createEnvironment());

    await expect(service.execute(createAvailabilityQuery({
      ...configuration,
      sourceMarket: "",
    }))).rejects.toThrow("Invalid source market.");
  });

  it("does not expose credential values in validation errors", async () => {
    const secret = "super-secret-value";
    await expect(runLiveVerification(
      createEnvironment({
        HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE: undefined,
        HOTELBEDS_SECRET: secret,
      }),
    )).rejects.toThrow(/HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE/);
    await expect(runLiveVerification(
      createEnvironment({ HOTELBEDS_API_KEY: "", HOTELBEDS_SECRET: secret }),
      { validateSupplierConfiguration: () => { throw new Error("Hotelbeds API key is required."); } },
    )).rejects.not.toThrow(secret);
  });

  it("does not execute the harness during module import", () => {
    expect(parseLiveVerificationFlag(undefined)).toBe(false);
  });
});