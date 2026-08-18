import {
  createHotelbedsIntegrationResult,
  HotelbedsGateway,
  HotelbedsIntegrationErrorCode,
  HotelbedsRequest,
  HotelbedsContentSynchronizationService,
  InMemoryHotelContentRepository,
  InMemoryHotelContentSyncStateRepository,
  HotelContentRepository,
  InMemoryHotelCatalogueRepository,
} from "@application/accommodation";

interface StubGatewayBehavior {
  readonly responses: ReadonlyArray<unknown>;
  readonly failuresAtCall?: number;
  readonly failureCode?: string;
  readonly failureMessage?: string;
  readonly retryable?: boolean;
}

class StubHotelbedsGateway implements HotelbedsGateway {
  public readonly seenRequests: HotelbedsRequest[] = [];
  private callCount = 0;

  public constructor(private readonly behavior: StubGatewayBehavior) {}

  public async execute<T>(request: HotelbedsRequest) {
    this.seenRequests.push(request);
    this.callCount += 1;

    if (this.behavior.failuresAtCall && this.callCount === this.behavior.failuresAtCall) {
      return createHotelbedsIntegrationResult<T>({
        success: false,
        operation: request.operation,
        provider: "hotelbeds",
        retryable: this.behavior.retryable ?? false,
        data: null,
        errors: [
          {
            code: (this.behavior.failureCode as HotelbedsIntegrationErrorCode) ??
              HotelbedsIntegrationErrorCode.PROVIDER_ERROR,
            message: this.behavior.failureMessage ?? "Provider failure",
            retryable: this.behavior.retryable ?? false,
          },
        ],
        metadata: {
          completedAt: new Date(),
        },
      });
    }

    const index = Math.max(this.callCount - 1, 0);
    const payload = this.behavior.responses[index] ?? { hotels: [] };

    return createHotelbedsIntegrationResult<T>({
      success: true,
      operation: request.operation,
      provider: "hotelbeds",
      retryable: false,
      data: payload as T,
      errors: [],
      metadata: {
        completedAt: new Date(),
      },
    });
  }
}

class FailingRepository implements HotelContentRepository {
  public async upsertMany(): Promise<void> {
    throw new Error("persistence down");
  }

  public async findByProviderHotelCode() {
    return null;
  }

  public async all() {
    return [];
  }
}

function hotel(code: number, name: string) {
  return {
    code,
    name: { content: name },
    description: [{ content: `${name} description` }],
    categoryCode: "4EST",
    categoryName: "4 STARS",
    accommodationTypeCode: "HOTEL",
    accommodationTypeName: "Hotel",
    destinationCode: "CPT",
    destinationName: "Cape Town",
    latitude: "-33.9249",
    longitude: "18.4241",
    address: {
      content: "1 Test Street",
      city: "Cape Town",
      countryCode: "ZA",
      countryName: "South Africa",
    },
    facilities: [
      {
        facilityCode: 10,
        facilityName: "Wi-Fi",
        facilityGroupCode: 60,
        facilityGroupName: "Internet",
      },
    ],
    images: [{ path: `https://cdn.example/${code}.jpg`, order: 1 }],
  };
}

describe("HotelbedsContentSynchronizationService", () => {
  it("runs full synchronization with deterministic pagination and checkpoint update", async () => {
    const gateway = new StubHotelbedsGateway({
      responses: [
        { hotels: [hotel(1, "One"), hotel(2, "Two")] },
        { hotels: [hotel(3, "Three")] },
      ],
    });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const service = new HotelbedsContentSynchronizationService(gateway, contentRepository, stateRepository);

    const result = await service.synchronizeFull({ language: "ENG", selectedHotelCodes: ["1", "2"] });

    expect(result.success).toBe(true);
    expect(result.processedCount).toBe(2);
    expect(result.pagesProcessed).toBe(1);

    expect(gateway.seenRequests).toHaveLength(1);
    expect(gateway.seenRequests[0]?.query?.fields).toBe("all");
    expect(gateway.seenRequests[0]?.query?.codes).toBe("1,2");

    const all = await contentRepository.all();
    expect(all).toHaveLength(2);
    expect(all.map((record) => record.providerHotelCode)).toEqual(["1", "2"]);

    const state = await stateRepository.getState();
    expect(state?.executionStatus).toBe("SUCCEEDED");
    expect(state?.processedCount).toBe(2);
    expect(state?.metadata.pagesProcessed).toBe(1);
    expect(state?.lastSuccessfulCheckpoint).toBeDefined();
  });

  it("runs incremental synchronization using previous checkpoint", async () => {
    const gateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(10, "Ten")] }],
    });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const service = new HotelbedsContentSynchronizationService(gateway, contentRepository, stateRepository);

    await service.synchronizeFull({ selectedHotelCodes: ["10"] });
    await service.synchronizeIncremental({ selectedHotelCodes: ["10"] });

    const incrementalRequest = gateway.seenRequests[gateway.seenRequests.length - 1]!;
    expect(incrementalRequest.query?.lastUpdateTime).toBeDefined();
    expect(incrementalRequest.query?.codes).toBe("10");
  });

  it("does not advance checkpoint when provider call fails", async () => {
    const seedGateway = new StubHotelbedsGateway({ responses: [{ hotels: [hotel(20, "Twenty")] }] });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();

    const service = new HotelbedsContentSynchronizationService(seedGateway, contentRepository, stateRepository);
    await service.synchronizeFull();
    const before = await stateRepository.getState();

    const failingGateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(21, "Twenty One")] }],
      failuresAtCall: 1,
      failureCode: HotelbedsIntegrationErrorCode.NETWORK_ERROR,
      failureMessage: "network issue",
      retryable: true,
    });
    const failingService = new HotelbedsContentSynchronizationService(
      failingGateway,
      contentRepository,
      stateRepository,
    );

    const result = await failingService.synchronizeIncremental({ selectedHotelCodes: ["21"], maxRetries: 0 });
    const after = await stateRepository.getState();

    expect(result.success).toBe(false);
    expect(result.retryable).toBe(true);
    expect(result.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.NETWORK_ERROR);
    expect(after?.executionStatus).toBe("FAILED");
    expect(after?.lastSuccessfulCheckpoint?.toISOString()).toBe(
      before?.lastSuccessfulCheckpoint?.toISOString(),
    );
  });

  it("supports safe rerun after failure with idempotent upsert behavior", async () => {
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();

    const failingGateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(30, "Thirty")] }],
      failuresAtCall: 1,
      failureCode: HotelbedsIntegrationErrorCode.TIMEOUT,
      retryable: true,
    });

    const serviceWithFailure = new HotelbedsContentSynchronizationService(
      failingGateway,
      contentRepository,
      stateRepository,
    );

    const failed = await serviceWithFailure.synchronizeFull({ selectedHotelCodes: ["30"], maxRetries: 0 });
    expect(failed.success).toBe(false);

    const recoveryGateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(30, "Thirty")] }, { hotels: [hotel(30, "Thirty")] }],
    });
    const recoveryService = new HotelbedsContentSynchronizationService(
      recoveryGateway,
      contentRepository,
      stateRepository,
    );

    const recovered = await recoveryService.synchronizeFull({ selectedHotelCodes: ["30"] });
    const rerun = await recoveryService.synchronizeFull({ selectedHotelCodes: ["30"] });
    const all = await contentRepository.all();

    expect(recovered.success).toBe(true);
    expect(rerun.success).toBe(true);
    expect(all).toHaveLength(1);
    expect(all[0]?.providerHotelCode).toBe("30");
  });

  it("fails for malformed provider response structure", async () => {
    const gateway = new StubHotelbedsGateway({ responses: [{ notHotels: [] }] });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const service = new HotelbedsContentSynchronizationService(gateway, contentRepository, stateRepository);

    const result = await service.synchronizeFull({ selectedHotelCodes: ["40"] });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE);
  });

  it("fails for mapping error when hotel identity data is invalid", async () => {
    const gateway = new StubHotelbedsGateway({
      responses: [{ hotels: [{ code: 40 }] }],
    });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const service = new HotelbedsContentSynchronizationService(gateway, contentRepository, stateRepository);

    const result = await service.synchronizeFull({ selectedHotelCodes: ["40"] });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.VALIDATION_ERROR);
  });

  it("maps actual Hotelbeds text-object name and description payloads", async () => {
    const gateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(60, "Sixty")] }],
    });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const service = new HotelbedsContentSynchronizationService(gateway, contentRepository, stateRepository);

    const result = await service.synchronizeFull({ language: "ENG", selectedHotelCodes: ["60"] });
    const all = await contentRepository.all();

    expect(result.success).toBe(true);
    expect(all).toHaveLength(1);
    expect(all[0]?.providerHotelCode).toBe("60");
    expect(all[0]?.name).toBe("Sixty");
    expect(all[0]?.description).toBe("Sixty description");
    expect(all[0]?.address?.city).toBe("Cape Town");
    expect(all[0]?.facilities[0]?.name).toBe("Wi-Fi");
    expect(all[0]?.images[0]?.url).toContain("60.jpg");
  });

  it("fails for persistence error and keeps checkpoint safety", async () => {
    const gateway = new StubHotelbedsGateway({ responses: [{ hotels: [hotel(50, "Fifty")] }] });
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const service = new HotelbedsContentSynchronizationService(
      gateway,
      new FailingRepository(),
      stateRepository,
    );

    const result = await service.synchronizeFull({ selectedHotelCodes: ["50"] });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.UNKNOWN_ERROR);

    const state = await stateRepository.getState();
    expect(state?.executionStatus).toBe("FAILED");
    expect(state?.lastSuccessfulCheckpoint).toBeUndefined();
  });

  it("prevents overlapping synchronization executions", async () => {
    const gateway = new StubHotelbedsGateway({ responses: [{ hotels: [] }] });
    const contentRepository = new InMemoryHotelContentRepository();
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    await stateRepository.saveState({
      type: "FULL",
      executionStatus: "RUNNING",
      processedCount: 0,
      failedCount: 0,
      metadata: {
        pagesProcessed: 0,
      },
    });

    const service = new HotelbedsContentSynchronizationService(gateway, contentRepository, stateRepository);
    const result = await service.synchronizeFull({ selectedHotelCodes: ["1"] });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(HotelbedsIntegrationErrorCode.PROVIDER_ERROR);
  });

  it("uses active catalogue codes as the authoritative boundary", async () => {
    const catalogue = new InMemoryHotelCatalogueRepository();
    await catalogue.upsert({ hotelCode: "1", starGrading: 4, destinationCode: "CPT", zoneCode: "1", zoneName: "Cape Town", active: true });
    const gateway = new StubHotelbedsGateway({ responses: [{ hotels: [hotel(1, "One"), hotel(999, "Outside")] }] });
    const service = new HotelbedsContentSynchronizationService(
      gateway,
      new InMemoryHotelContentRepository(),
      new InMemoryHotelContentSyncStateRepository(),
      undefined,
      ["999"],
      catalogue,
      { batchSize: 50, maxQps: 100, maxRetries: 0, retryBaseDelayMs: 1, sleep: async () => undefined },
    );

    await expect(service.synchronizeFull()).resolves.toMatchObject({ selectedHotelCount: 1 });
    expect(gateway.seenRequests[0]?.query?.codes).toBe("1");
  });

  it("continues successfully and reports supplier-missing hotels", async () => {
    const gateway = new StubHotelbedsGateway({ responses: [{ hotels: [] }] });
    const service = new HotelbedsContentSynchronizationService(
      gateway,
      new InMemoryHotelContentRepository(),
      new InMemoryHotelContentSyncStateRepository(),
      undefined,
      [],
      undefined,
      { batchSize: 50, maxQps: 100, maxRetries: 0, retryBaseDelayMs: 1, sleep: async () => undefined },
    );

    const result = await service.synchronizeFull({ selectedHotelCodes: ["1"] });
    expect(result.success).toBe(true);
    expect(result.missingHotelCodes).toEqual(["1"]);
    expect(result.failedBatches).toEqual([]);
  });

  it("retries retryable failures with bounded backoff", async () => {
    const gateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(1, "One")] }, { hotels: [hotel(1, "One")] }],
      failuresAtCall: 1,
      failureCode: HotelbedsIntegrationErrorCode.RATE_LIMITED,
      retryable: true,
    });
    const service = new HotelbedsContentSynchronizationService(
      gateway,
      new InMemoryHotelContentRepository(),
      new InMemoryHotelContentSyncStateRepository(),
      undefined,
      [],
      undefined,
      { batchSize: 50, maxQps: 100, maxRetries: 1, retryBaseDelayMs: 1, sleep: async () => undefined },
    );

    const result = await service.synchronizeFull({ selectedHotelCodes: ["1"] });
    expect(result.success).toBe(true);
    expect(result.requestCount).toBe(2);
    expect(result.retryCount).toBe(1);
  });

  it("processes bounded batches sequentially and applies QPS pacing", async () => {
    const delays: number[] = [];
    const gateway = new StubHotelbedsGateway({
      responses: [
        { hotels: [hotel(1, "One")] },
        { hotels: [hotel(2, "Two")] },
        { hotels: [hotel(3, "Three")] },
      ],
    });
    const service = new HotelbedsContentSynchronizationService(
      gateway,
      new InMemoryHotelContentRepository(),
      new InMemoryHotelContentSyncStateRepository(),
      undefined,
      [],
      undefined,
      { batchSize: 1, maxQps: 2, maxRetries: 0, retryBaseDelayMs: 1, sleep: async (delayMs) => { delays.push(delayMs); } },
    );

    const result = await service.synchronizeFull({ selectedHotelCodes: ["1", "2", "3"] });
    expect(result.success).toBe(true);
    expect(result.batchCount).toBe(3);
    expect(result.requestCount).toBe(3);
    expect(gateway.seenRequests.map((request) => request.query?.codes)).toEqual(["1", "2", "3"]);
    expect(delays.length).toBeGreaterThanOrEqual(2);
  });

  it("resumes a failed full synchronization from the first incomplete batch", async () => {
    const stateRepository = new InMemoryHotelContentSyncStateRepository();
    const contentRepository = new InMemoryHotelContentRepository();
    const firstGateway = new StubHotelbedsGateway({
      responses: [{ hotels: [hotel(1, "One")] }, { hotels: [hotel(2, "Two")] }],
      failuresAtCall: 2,
      failureCode: HotelbedsIntegrationErrorCode.NETWORK_ERROR,
      retryable: false,
    });
    const settings = { batchSize: 1, maxQps: 100, maxRetries: 0, retryBaseDelayMs: 1, sleep: async () => undefined };
    const firstService = new HotelbedsContentSynchronizationService(firstGateway, contentRepository, stateRepository, undefined, [], undefined, settings);
    const failed = await firstService.synchronizeFull({ selectedHotelCodes: ["1", "2"] });
    expect(failed.success).toBe(false);
    expect((await stateRepository.getState())?.lastSuccessfulBatch).toBe(1);

    const recoveryGateway = new StubHotelbedsGateway({ responses: [{ hotels: [hotel(2, "Two")] }] });
    const recoveryService = new HotelbedsContentSynchronizationService(recoveryGateway, contentRepository, stateRepository, undefined, [], undefined, settings);
    const recovered = await recoveryService.synchronizeFull({ selectedHotelCodes: ["1", "2"] });
    expect(recovered.success).toBe(true);
    expect(recoveryGateway.seenRequests).toHaveLength(1);
    expect(recoveryGateway.seenRequests[0]?.query?.codes).toBe("2");
    expect((await stateRepository.getState())?.lastSuccessfulBatch).toBe(2);
  });
});
